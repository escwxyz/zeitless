import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { baseTableColumns } from "../utils";
import type { OrderId } from "../utils";

interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  size: string;
  price: number;
  currency: string;
}

interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

const orderBaseColumns = baseTableColumns<OrderId>();

export const order = sqliteTable(
  "orders",
  {
    ...orderBaseColumns,
    email: text("email").notNull(),
    emailToken: text("email_token").unique(),
    items: text("items").$type<OrderItem[]>().notNull(),
    totalPrice: integer("total_price").notNull(),
    currency: text("currency").notNull(),
    status: text("status", {
      enum: ["reserved", "paid", "cancelled", "shipped", "completed"],
    })
      .default("reserved")
      .notNull(),
    shippingInfo: text("shipping_info").$type<ShippingAddress>().notNull(),
    reservedAt: integer("reserved_at", { mode: "timestamp_ms" }).notNull(),
    reservedUntil: integer("reserved_until", { mode: "timestamp_ms" }).notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeRefundId: text("stripe_refund_id"),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    cancelledAt: integer("cancelled_at", { mode: "timestamp_ms" }),
    refundedAt: integer("refunded_at", { mode: "timestamp_ms" }),
    trackingCarrier: text("tracking_carrier"),
    trackingNumber: text("tracking_number"),
    internalNotes: text("internal_notes"),
    refundReason: text("refund_reason"),
  },
  (table) => [
    index("order_email_idx").on(table.email),
    index("order_status_idx").on(table.status),
    index("order_reserved_until_idx").on(table.reservedUntil),
    index("order_created_at_idx").on(table.createdAt),
  ],
);
