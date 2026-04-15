import { ORPCError } from "@orpc/server";
import type {
  order as orderTable,
  product as productTable,
  reservation as reservationTable,
} from "@zeitless/db/schema";
import type {
  buyerOrderSchema,
  cartItemSchema,
  cartSchema,
  checkoutSessionSchema,
  adminProductSchema,
  productSchema,
  reservationSchema,
} from "@zeitless/contract";
import type { Context } from "../../context";
import type { z } from "zod";

export type CommerceBindings = Context["bindings"];

type Product = z.infer<typeof productSchema>;
type Cart = z.infer<typeof cartSchema>;
type CartItem = z.infer<typeof cartItemSchema>;
type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
type Reservation = z.infer<typeof reservationSchema>;
type BuyerOrder = z.infer<typeof buyerOrderSchema>;
type AdminProduct = z.infer<typeof adminProductSchema>;

export type ProductRow = typeof productTable.$inferSelect;
export type ReservationRow = typeof reservationTable.$inferSelect;
export type OrderRow = typeof orderTable.$inferSelect;

export const encodeCursor = (row: { createdAt: Date; id: string }) =>
  `${row.createdAt.getTime()}:${row.id}`;

export const decodeCursor = (cursor: string) => {
  const separatorIndex = cursor.indexOf(":");

  if (separatorIndex <= 0) {
    throw new ORPCError("BAD_REQUEST");
  }

  const createdAt = Number(cursor.slice(0, separatorIndex));
  const id = cursor.slice(separatorIndex + 1);

  if (!Number.isFinite(createdAt) || id.length === 0) {
    throw new ORPCError("BAD_REQUEST");
  }

  return {
    createdAt: new Date(createdAt),
    id,
  };
};

export const parseJson = <T>(value: string | T): T =>
  typeof value === "string" ? (JSON.parse(value) as T) : value;

export const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

export const toRequiredIsoString = (value: Date | string | null | undefined) => {
  const iso = toIsoString(value);

  if (!iso) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  return iso;
};

export const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  title: row.title,
  brand: row.brand,
  category: row.category,
  condition: row.condition,
  size: row.size,
  price: row.price,
  currency: row.currency,
  description: row.description,
  images: parseJson(row.images),
  isSold: row.isSold,
  reservationStatus: row.reservationStatus,
  reservedUntil: toIsoString(row.reservedUntil),
  createdAt: toRequiredIsoString(row.createdAt),
});

export const toAdminProduct = (row: ProductRow): AdminProduct => ({
  ...toProduct(row),
  costPrice: row.costPrice ?? undefined,
  draft: row.draft,
  internalNotes: row.internalNotes ?? undefined,
  internalTags: parseJson(row.internalTags),
  publishedAt: toIsoString(row.publishedAt),
  updatedBy: row.updatedBy,
});

export const toCartItem = (row: ProductRow, addedAt: Date | string): CartItem => ({
  product: toProduct(row),
  addedAt: toRequiredIsoString(addedAt),
});

export const toCart = (input: {
  id: string;
  email?: string | null;
  items: CartItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}): Cart => ({
  id: input.id,
  email: input.email ?? null,
  items: input.items,
  createdAt: toRequiredIsoString(input.createdAt),
  updatedAt: toRequiredIsoString(input.updatedAt),
});

export const toCheckoutSession = (input: {
  id: string;
  cartId: string;
  reservationId: string;
  email: string;
  status: CheckoutSession["status"];
  reservedUntil: Date | string;
  totalPrice: number;
  currency: string;
  stripeCheckoutSessionId?: string;
  stripeCheckoutUrl?: string;
  createdAt: Date | string;
}): CheckoutSession => ({
  id: input.id,
  cartId: input.cartId,
  reservationId: input.reservationId,
  email: input.email,
  status: input.status,
  reservedUntil: toRequiredIsoString(input.reservedUntil),
  totalPrice: input.totalPrice,
  currency: input.currency,
  stripeCheckoutSessionId: input.stripeCheckoutSessionId,
  stripeCheckoutUrl: input.stripeCheckoutUrl,
  createdAt: toRequiredIsoString(input.createdAt),
});

export const toReservation = (row: ReservationRow): Reservation => ({
  id: row.id,
  productId: row.productId,
  email: row.email,
  status: row.status,
  reservedUntil: toRequiredIsoString(row.reservedUntil),
  releasedAt: toIsoString(row.releasedAt),
  createdAt: toRequiredIsoString(row.createdAt),
});

export const toOrder = (row: OrderRow): BuyerOrder => ({
  id: row.id,
  email: row.email,
  items: parseJson(row.items),
  totalPrice: row.totalPrice,
  currency: row.currency,
  status: row.status,
  shippingInfo: parseJson(row.shippingInfo),
  reservedAt: toRequiredIsoString(row.reservedAt),
  reservedUntil: toRequiredIsoString(row.reservedUntil),
  paidAt: toIsoString(row.paidAt),
  cancelledAt: toIsoString(row.cancelledAt),
  refundedAt: toIsoString(row.refundedAt),
  createdAt: toRequiredIsoString(row.createdAt),
});
