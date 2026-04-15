import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import type { reservationSchema } from "@zeitless/contract";
import { asReservationId, createDb } from "@zeitless/db";
import { reservation as reservationTable } from "@zeitless/db/schema";
import type { z } from "zod";

import type { CommerceBindings } from "./shared";
import { fetchReservationDo } from "./do";

type Reservation = z.infer<typeof reservationSchema>;

interface ReservationCreateInput {
  productId: string;
  email: string;
  cartId?: string;
}

interface ReservationIdInput {
  reservationId: string;
}

interface ReservationBody {
  email?: string;
  cartId?: string;
  reservationId?: string;
}

const getReservationProductId = async (bindings: CommerceBindings, reservationId: string) => {
  const db = createDb(bindings.DB);
  const [row] = await db
    .select({ productId: reservationTable.productId })
    .from(reservationTable)
    .where(eq(reservationTable.id, asReservationId(reservationId)))
    .limit(1);

  if (!row) {
    throw new ORPCError("NOT_FOUND");
  }

  return row.productId;
};

export const createReservation = (
  bindings: CommerceBindings,
  input: ReservationCreateInput,
): Promise<Reservation> =>
  fetchReservationDo<Reservation>(bindings, input.productId, "/reserve", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      cartId: input.cartId,
    } satisfies ReservationBody),
  });

export const releaseReservationById = async (
  bindings: CommerceBindings,
  input: ReservationIdInput,
): Promise<Reservation> => {
  const productId = await getReservationProductId(bindings, input.reservationId);

  return fetchReservationDo<Reservation>(bindings, productId, "/release", {
    method: "POST",
    body: JSON.stringify({
      reservationId: input.reservationId,
    } satisfies ReservationBody),
  });
};

export const expireReservation = async (
  bindings: CommerceBindings,
  input: ReservationIdInput,
): Promise<Reservation> => {
  const productId = await getReservationProductId(bindings, input.reservationId);

  return fetchReservationDo<Reservation>(bindings, productId, "/expire", {
    method: "POST",
    body: JSON.stringify({
      reservationId: input.reservationId,
    } satisfies ReservationBody),
  });
};
