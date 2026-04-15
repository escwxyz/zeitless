import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import StripeClient from "stripe";
import type { buyerOrderSchema, orderCreateInputSchema } from "@zeitless/contract";
import { asOrderId, asProductId, asReservationId, createDb } from "@zeitless/db";
import {
  order as orderTable,
  product as productTable,
  reservation as reservationTable,
} from "@zeitless/db/schema";
import type { z } from "zod";

import { parseJson, toOrder } from "./shared";
import type { CommerceBindings } from "./shared";

type BuyerOrder = z.infer<typeof buyerOrderSchema>;
type OrderCreateInput = z.infer<typeof orderCreateInputSchema>;
interface CreatedOrderResult {
  order: BuyerOrder;
  created: boolean;
}

interface OrderAccessInput {
  orderId: string;
  emailToken: string;
}

const refundWindowMsSchema = z.coerce.number().int().positive();

const getRefundWindowMs = (bindings: CommerceBindings) => {
  const result = refundWindowMsSchema.safeParse(bindings.REFUND_WINDOW_MS);

  if (!result.success) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  return result.data;
};

const getStripeClient = (bindings: CommerceBindings) =>
  new StripeClient(bindings.STRIPE_SECRET_KEY);

export const createOrderRecord = async (
  bindings: CommerceBindings,
  input: OrderCreateInput,
): Promise<CreatedOrderResult> => {
  const db = createDb(bindings.DB);
  const result = await db.transaction(async (tx) => {
    const orderId = asOrderId(input.reservationId);
    const [existingOrder] = await tx
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .limit(1);

    if (existingOrder) {
      return {
        order: existingOrder,
        created: false,
      };
    }

    const [reservationRow] = await tx
      .select()
      .from(reservationTable)
      .where(
        and(
          eq(reservationTable.id, asReservationId(input.reservationId)),
          eq(reservationTable.status, "reserved"),
        ),
      )
      .limit(1);

    if (!reservationRow) {
      throw new ORPCError("CONFLICT");
    }

    const [productRow] = await tx
      .select()
      .from(productTable)
      .where(eq(productTable.id, asProductId(reservationRow.productId)))
      .limit(1);

    if (!productRow) {
      throw new ORPCError("NOT_FOUND");
    }

    await tx
      .insert(orderTable)
      .values({
        id: orderId,
        email: reservationRow.email,
        emailToken: crypto.randomUUID(),
        items: [
          {
            productId: productRow.id,
            title: productRow.title,
            brand: productRow.brand,
            size: productRow.size,
            price: productRow.price,
            currency: productRow.currency,
          },
        ],
        totalPrice: productRow.price,
        currency: productRow.currency,
        status: "reserved",
        shippingInfo: input.shippingInfo,
        reservedAt: reservationRow.createdAt,
        reservedUntil: reservationRow.reservedUntil,
        stripeCheckoutSessionId: null,
        stripePaymentIntentId: null,
        stripeRefundId: null,
        paidAt: null,
        cancelledAt: null,
        refundedAt: null,
      })
      .onConflictDoNothing();

    const [createdOrder] = await tx
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .limit(1);

    if (!createdOrder) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    return {
      order: createdOrder,
      created: true,
    };
  });

  return {
    order: toOrder(result.order),
    created: result.created,
  };
};

export const createOrder = async (
  bindings: CommerceBindings,
  input: OrderCreateInput,
): Promise<BuyerOrder> => {
  const result = await createOrderRecord(bindings, input);
  return result.order;
};

export const deleteOrderById = async (
  bindings: CommerceBindings,
  orderId: string,
): Promise<void> => {
  const db = createDb(bindings.DB);
  await db.delete(orderTable).where(eq(orderTable.id, asOrderId(orderId)));
};

export const updateOrderStripeCheckoutSessionId = async (
  bindings: CommerceBindings,
  orderId: string,
  stripeCheckoutSessionId: string,
): Promise<void> => {
  const db = createDb(bindings.DB);
  await db
    .update(orderTable)
    .set({
      stripeCheckoutSessionId,
    })
    .where(eq(orderTable.id, asOrderId(orderId)));
};

export const updateOrderStripePaymentIntentId = async (
  bindings: CommerceBindings,
  orderId: string,
  stripePaymentIntentId: string,
): Promise<void> => {
  const db = createDb(bindings.DB);
  await db
    .update(orderTable)
    .set({
      stripePaymentIntentId,
    })
    .where(eq(orderTable.id, asOrderId(orderId)));
};

export const findOrderById = async (
  bindings: CommerceBindings,
  orderId: string,
): Promise<BuyerOrder | null> => {
  const db = createDb(bindings.DB);
  const [row] = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, asOrderId(orderId)))
    .limit(1);

  return row ? toOrder(row) : null;
};

export const markOrderPaid = async (
  bindings: CommerceBindings,
  orderId: string,
  paymentIntentId?: string | null,
): Promise<BuyerOrder> => {
  const db = createDb(bindings.DB);
  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, asOrderId(orderId)))
      .limit(1);

    if (!row) {
      throw new ORPCError("NOT_FOUND");
    }

    if (row.status === "paid") {
      return row;
    }

    if (row.status !== "reserved") {
      throw new ORPCError("CONFLICT");
    }

    const paidAt = new Date();

    await tx
      .update(orderTable)
      .set({
        status: "paid",
        paidAt,
        stripePaymentIntentId: paymentIntentId ?? row.stripePaymentIntentId,
      })
      .where(eq(orderTable.id, row.id));

    return {
      ...row,
      status: "paid" as const,
      paidAt,
      stripePaymentIntentId: paymentIntentId ?? row.stripePaymentIntentId,
    };
  });

  return toOrder(result);
};

export const markOrderCancelledById = async (
  bindings: CommerceBindings,
  orderId: string,
  refundedAt: Date | null = null,
  stripeRefundId: string | null = null,
): Promise<BuyerOrder> => {
  const db = createDb(bindings.DB);
  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, asOrderId(orderId)))
      .limit(1);

    if (!row) {
      throw new ORPCError("NOT_FOUND");
    }

    if (row.status === "cancelled") {
      return row;
    }

    if (row.status === "paid" && !refundedAt) {
      throw new ORPCError("CONFLICT");
    }

    const cancelledAt = refundedAt ?? new Date();

    await tx
      .update(orderTable)
      .set({
        status: "cancelled",
        cancelledAt,
        refundedAt,
        stripeRefundId,
      })
      .where(eq(orderTable.id, row.id));

    return {
      ...row,
      status: "cancelled" as const,
      cancelledAt,
      refundedAt,
      stripeRefundId,
    };
  });

  return toOrder(result);
};

const refundStripePayment = async (
  bindings: CommerceBindings,
  row: typeof orderTable.$inferSelect,
) => {
  const stripe = getStripeClient(bindings);
  let paymentIntentId = row.stripePaymentIntentId;

  if (!paymentIntentId) {
    if (!row.stripeCheckoutSessionId) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    const session = await stripe.checkout.sessions.retrieve(row.stripeCheckoutSessionId);
    paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);
  }

  if (!paymentIntentId) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  const refund = await stripe.refunds.create(
    {
      payment_intent: paymentIntentId,
    },
    {
      idempotencyKey: `refund:${row.id}`,
    },
  );

  return {
    paymentIntentId,
    refundId: refund.id,
  };
};

export const getOrder = async (
  bindings: CommerceBindings,
  input: OrderAccessInput,
): Promise<BuyerOrder> => {
  const db = createDb(bindings.DB);
  const [row] = await db
    .select()
    .from(orderTable)
    .where(
      and(eq(orderTable.id, asOrderId(input.orderId)), eq(orderTable.emailToken, input.emailToken)),
    )
    .limit(1);

  if (!row) {
    throw new ORPCError("NOT_FOUND");
  }

  return toOrder(row);
};

export const cancelOrder = async (
  bindings: CommerceBindings,
  input: OrderAccessInput,
): Promise<BuyerOrder> => {
  const db = createDb(bindings.DB);
  const [row] = await db
    .select()
    .from(orderTable)
    .where(
      and(eq(orderTable.id, asOrderId(input.orderId)), eq(orderTable.emailToken, input.emailToken)),
    )
    .limit(1);

  if (!row) {
    throw new ORPCError("NOT_FOUND");
  }

  if (row.status === "cancelled") {
    return toOrder(row);
  }

  if (row.status !== "paid") {
    throw new ORPCError("CONFLICT");
  }

  if (!row.paidAt) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  const refundDeadline = new Date(row.paidAt.getTime() + getRefundWindowMs(bindings));
  if (Date.now() > refundDeadline.getTime()) {
    throw new ORPCError("CONFLICT");
  }

  const cancelledAt = new Date();
  const { refundId } = await refundStripePayment(bindings, row);

  const result = await db.transaction(async (tx) => {
    await tx
      .update(orderTable)
      .set({
        status: "cancelled",
        cancelledAt,
        refundedAt: cancelledAt,
        stripeRefundId: refundId,
      })
      .where(eq(orderTable.id, row.id));

    for (const item of parseJson<{ productId: string }[]>(row.items)) {
      await tx
        .update(productTable)
        .set({
          reservationStatus: "available",
          reservedUntil: null,
          isSold: false,
        })
        .where(eq(productTable.id, asProductId(item.productId)));

      await tx
        .update(reservationTable)
        .set({
          status: "available",
          releasedAt: cancelledAt,
        })
        .where(eq(reservationTable.productId, asProductId(item.productId)));
    }

    return {
      ...row,
      status: "cancelled" as const,
      cancelledAt,
      refundedAt: cancelledAt,
      stripeRefundId: refundId,
    };
  });

  return toOrder(result);
};
