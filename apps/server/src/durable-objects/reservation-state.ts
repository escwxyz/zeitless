import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { DurableObject } from "cloudflare:workers";
import { asProductId, asReservationId, createDb } from "@zeitless/db";
import { product as productTable, reservation as reservationTable } from "@zeitless/db/schema";
import { z } from "zod";

import { toReservation } from "@zeitless/api/routers/commerce/shared";
type Db = ReturnType<typeof createDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

const reservationWindowMs = 30 * 60 * 1000;

const reserveInputSchema = z.object({
  email: z.email(),
  cartId: z.string().min(1).optional(),
});

const reservationIdInputSchema = z.object({
  reservationId: z.string().min(1),
});

const jsonResponse = (body: unknown, status = 200) => Response.json(body, { status });

const getProductId = (state: DurableObjectState): string => {
  if (!state.id.name) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  return state.id.name;
};

const getActiveReservationRow = async (tx: Tx, productId: string) => {
  // Always reconcile against the latest reserved row so stale reservations do not linger.
  const [row] = await tx
    .select()
    .from(reservationTable)
    .where(
      and(
        eq(reservationTable.productId, asProductId(productId)),
        eq(reservationTable.status, "reserved"),
      ),
    )
    .orderBy(desc(reservationTable.createdAt))
    .limit(1);

  if (!row) {
    return null;
  }

  if (row.reservedUntil.getTime() <= Date.now()) {
    await releaseReservationRow(tx, row, new Date());
    return null;
  }

  return row;
};

const releaseReservationRow = async (
  tx: Tx,
  row: typeof reservationTable.$inferSelect,
  releasedAt: Date,
) => {
  await tx
    .update(reservationTable)
    .set({
      status: "available",
      releasedAt,
    })
    .where(eq(reservationTable.id, row.id));

  await tx
    .update(productTable)
    .set({
      reservationStatus: "available",
      reservedUntil: null,
      isSold: false,
    })
    .where(eq(productTable.id, asProductId(row.productId)));

  return {
    ...row,
    status: "available" as const,
    releasedAt,
  };
};

const sellReservationRow = async (tx: Tx, row: typeof reservationTable.$inferSelect) => {
  await tx
    .update(reservationTable)
    .set({
      status: "sold",
    })
    .where(eq(reservationTable.id, row.id));

  await tx
    .update(productTable)
    .set({
      reservationStatus: "sold",
      reservedUntil: null,
      isSold: true,
    })
    .where(eq(productTable.id, asProductId(row.productId)));

  return {
    ...row,
    status: "sold" as const,
  };
};

const createReservationRow = async (
  tx: Tx,
  productRow: typeof productTable.$inferSelect,
  input: z.infer<typeof reserveInputSchema>,
) => {
  const reservedUntil = new Date(Date.now() + reservationWindowMs);
  const [row] = await tx
    .insert(reservationTable)
    .values({
      productId: productRow.id,
      email: input.email,
      status: "reserved",
      reservedUntil,
      releasedAt: null,
      cartId: input.cartId ?? null,
    })
    .returning();

  if (!row) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  // Keep the product record and reservation row in sync inside the same transaction.
  await tx
    .update(productTable)
    .set({
      reservationStatus: "reserved",
      reservedUntil,
    })
    .where(eq(productTable.id, productRow.id));

  return row;
};

const releaseReservationById = async (tx: Tx, productId: string, reservationId: string) => {
  const activeReservation = await getActiveReservationRow(tx, productId);

  if (activeReservation && activeReservation.id !== reservationId) {
    throw new ORPCError("CONFLICT");
  }

  if (activeReservation && activeReservation.id === reservationId) {
    return releaseReservationRow(tx, activeReservation, new Date());
  }

  const [row] = await tx
    .select()
    .from(reservationTable)
    .where(eq(reservationTable.id, asReservationId(reservationId)))
    .limit(1);

  if (!row || row.productId !== productId) {
    throw new ORPCError("NOT_FOUND");
  }

  if (row.status !== "reserved") {
    return row;
  }

  return releaseReservationRow(tx, row, new Date());
};

export class ReservationState extends DurableObject<Env> {
  // One reservation DO is keyed per product, so the DO owns both the active row and expiry timer.
  override fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === "GET" && url.pathname === "/") {
      return this.getCurrentReservation();
    }

    if (method === "POST" && url.pathname === "/reserve") {
      return this.reserveReservation(request);
    }

    if (method === "POST" && url.pathname === "/release") {
      return this.releaseReservation(request);
    }

    if (method === "POST" && url.pathname === "/sell") {
      return this.sellReservation(request);
    }

    if (method === "POST" && url.pathname === "/expire") {
      return this.expireReservation(request);
    }

    return Promise.resolve(new Response("Not Found", { status: 404 }));
  }

  override async alarm(): Promise<void> {
    const db = createDb(this.env.DB);
    const productId = getProductId(this.ctx);

    // Alarm expiry is the final safety net if checkout never explicitly releases the reservation.
    await db.transaction(async (tx) => {
      const activeReservation = await getActiveReservationRow(tx, productId);

      if (!activeReservation || activeReservation.reservedUntil.getTime() > Date.now()) {
        return;
      }

      await releaseReservationRow(tx, activeReservation, new Date());
    });
  }

  private async getCurrentReservation(): Promise<Response> {
    const db = createDb(this.env.DB);
    const productId = getProductId(this.ctx);

    const reservation = await db.transaction((tx) => getActiveReservationRow(tx, productId));

    if (!reservation) {
      return new Response("Not Found", { status: 404 });
    }

    return jsonResponse(toReservation(reservation));
  }

  private async reserveReservation(request: Request): Promise<Response> {
    const body = reserveInputSchema.parse(await request.json());
    const db = createDb(this.env.DB);
    const productId = getProductId(this.ctx);

    const reservation = await db.transaction(async (tx) => {
      const activeReservation = await getActiveReservationRow(tx, productId);

      // Only one active reservation can exist for a product at a time.
      if (activeReservation) {
        if (
          activeReservation.email === body.email &&
          activeReservation.cartId === (body.cartId ?? null)
        ) {
          return activeReservation;
        }

        throw new ORPCError("CONFLICT");
      }

      const [productRow] = await tx
        .select()
        .from(productTable)
        .where(eq(productTable.id, asProductId(productId)))
        .limit(1);

      if (
        !productRow ||
        productRow.draft ||
        productRow.isSold ||
        productRow.reservationStatus !== "available"
      ) {
        throw new ORPCError("CONFLICT");
      }

      return createReservationRow(tx, productRow, body);
    });

    await this.ctx.storage.setAlarm(new Date(reservation.reservedUntil));
    return jsonResponse(toReservation(reservation), 201);
  }

  private async releaseReservation(request: Request): Promise<Response> {
    const body = reservationIdInputSchema.parse(await request.json());
    const db = createDb(this.env.DB);
    const productId = getProductId(this.ctx);

    const reservation = await db.transaction((tx) =>
      releaseReservationById(tx, productId, body.reservationId),
    );

    await this.ctx.storage.deleteAlarm();
    return jsonResponse(toReservation(reservation));
  }

  private async expireReservation(request: Request): Promise<Response> {
    const body = reservationIdInputSchema.parse(await request.json());
    const db = createDb(this.env.DB);
    const productId = getProductId(this.ctx);

    const reservation = await db.transaction((tx) =>
      releaseReservationById(tx, productId, body.reservationId),
    );

    await this.ctx.storage.deleteAlarm();
    return jsonResponse(toReservation(reservation));
  }

  private async sellReservation(request: Request): Promise<Response> {
    const body = reservationIdInputSchema.parse(await request.json());
    const db = createDb(this.env.DB);
    const productId = getProductId(this.ctx);

    const reservation = await db.transaction(async (tx) => {
      const activeReservation = await getActiveReservationRow(tx, productId);

      if (activeReservation && activeReservation.id !== body.reservationId) {
        throw new ORPCError("CONFLICT");
      }

      if (activeReservation && activeReservation.id === body.reservationId) {
        return sellReservationRow(tx, activeReservation);
      }

      const [row] = await tx
        .select()
        .from(reservationTable)
        .where(eq(reservationTable.id, asReservationId(body.reservationId)))
        .limit(1);

      if (!row || row.productId !== productId) {
        throw new ORPCError("NOT_FOUND");
      }

      if (row.status === "sold") {
        return row;
      }

      if (row.status !== "reserved") {
        throw new ORPCError("CONFLICT");
      }

      return sellReservationRow(tx, row);
    });

    await this.ctx.storage.deleteAlarm();
    return jsonResponse(toReservation(reservation));
  }
}
