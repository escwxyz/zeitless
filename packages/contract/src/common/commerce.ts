import { z } from "zod";

import { cursorPaginationInputSchema, paginatedResponseSchema } from "./pagination";
import { idSchema } from "./ids";
import { orderStatusSchema, productConditionSchema, reservationStatusSchema } from "./enums";

const timestampSchema = z.string().datetime();

export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);

export const moneyAmountSchema = z.number().int().nonnegative();

export const productImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().min(1).optional(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().min(1).optional(),
  city: z.string().min(1),
  region: z.string().min(1).optional(),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  phone: z.string().min(1).optional(),
});

export const productSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  condition: productConditionSchema,
  size: z.string().min(1),
  price: moneyAmountSchema,
  currency: currencyCodeSchema,
  description: z.string().min(1),
  images: z.array(productImageSchema),
  isSold: z.boolean(),
  reservationStatus: reservationStatusSchema,
  reservedUntil: timestampSchema.nullable().optional(),
  createdAt: timestampSchema,
});

export const adminProductSchema = productSchema.extend({
  costPrice: moneyAmountSchema.optional(),
  draft: z.boolean(),
  internalNotes: z.string().min(1).optional(),
  internalTags: z.array(z.string().min(1)),
  publishedAt: timestampSchema.nullable().optional(),
  updatedBy: idSchema.nullable().optional(),
});

export const productListInputSchema = cursorPaginationInputSchema.extend({
  brand: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  condition: productConditionSchema.optional(),
});

export const adminProductPublicationStateSchema = z.enum(["all", "draft", "published"]);
export const adminProductInventoryStateSchema = z.enum(["all", "non-sold", "sold"]);

export const adminProductListInputSchema = cursorPaginationInputSchema.extend({
  brand: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  condition: productConditionSchema.optional(),
  publicationState: adminProductPublicationStateSchema.default("all"),
  inventoryState: adminProductInventoryStateSchema.default("non-sold"),
});

export const productIdInputSchema = z.object({
  productId: idSchema,
});

export const adminProductWriteSchema = z.object({
  title: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  condition: productConditionSchema,
  size: z.string().min(1),
  price: moneyAmountSchema,
  currency: currencyCodeSchema,
  description: z.string().min(1),
  images: z.array(productImageSchema),
  costPrice: moneyAmountSchema.optional(),
  draft: z.boolean().default(true),
  internalNotes: z.string().min(1).optional(),
  internalTags: z.array(z.string().min(1)).default([]),
});

export const adminProductPatchSchema = z.object({
  title: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  condition: productConditionSchema.optional(),
  size: z.string().min(1).optional(),
  price: moneyAmountSchema.optional(),
  currency: currencyCodeSchema.optional(),
  description: z.string().min(1).optional(),
  images: z.array(productImageSchema).optional(),
  costPrice: moneyAmountSchema.nullable().optional(),
  draft: z.boolean().optional(),
  internalNotes: z.string().min(1).nullable().optional(),
  internalTags: z.array(z.string().min(1)).optional(),
});

export const reservationSchema = z.object({
  id: idSchema,
  productId: idSchema,
  email: z.email(),
  status: reservationStatusSchema,
  reservedUntil: timestampSchema,
  releasedAt: timestampSchema.nullable().optional(),
  createdAt: timestampSchema,
});

export const reservationCreateInputSchema = z.object({
  productId: idSchema,
  email: z.email(),
  cartId: idSchema.optional(),
});

export const reservationIdInputSchema = z.object({
  reservationId: idSchema,
});

export const cartItemSchema = z.object({
  product: productSchema,
  addedAt: timestampSchema,
});

export const cartSchema = z.object({
  id: idSchema,
  email: z.email().nullable().optional(),
  items: z.array(cartItemSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const cartIdInputSchema = z.object({
  cartId: idSchema,
});

export const cartItemInputSchema = z.object({
  cartId: idSchema,
  productId: idSchema,
});

export const checkoutShippingSchema = shippingAddressSchema;

export const checkoutStartInputSchema = z.object({
  cartId: idSchema,
  email: z.email(),
  shippingAddress: checkoutShippingSchema,
});

export const orderCreateInputSchema = z.object({
  reservationId: idSchema,
  shippingInfo: shippingAddressSchema,
});

export const checkoutSessionSchema = z.object({
  id: idSchema,
  cartId: idSchema,
  reservationId: idSchema,
  email: z.email(),
  status: z.enum(["pending", "reserved", "expired", "completed"]),
  reservedUntil: timestampSchema,
  totalPrice: moneyAmountSchema,
  currency: currencyCodeSchema,
  stripeCheckoutSessionId: z.string().min(1).optional(),
  stripeCheckoutUrl: z.string().url().optional(),
  createdAt: timestampSchema,
});

export const orderItemSchema = z.object({
  productId: idSchema,
  title: z.string().min(1),
  brand: z.string().min(1),
  size: z.string().min(1),
  price: moneyAmountSchema,
  currency: currencyCodeSchema,
});

export const orderShippingInfoSchema = shippingAddressSchema;

export const buyerOrderSchema = z.object({
  id: idSchema,
  email: z.email(),
  items: z.array(orderItemSchema),
  totalPrice: moneyAmountSchema,
  currency: currencyCodeSchema,
  status: orderStatusSchema,
  shippingInfo: orderShippingInfoSchema,
  reservedAt: timestampSchema,
  reservedUntil: timestampSchema,
  paidAt: timestampSchema.nullable().optional(),
  cancelledAt: timestampSchema.nullable().optional(),
  refundedAt: timestampSchema.nullable().optional(),
  createdAt: timestampSchema,
});

export const adminOrderSchema = buyerOrderSchema.extend({
  trackingCarrier: z.string().min(1).nullable().optional(),
  trackingNumber: z.string().min(1).nullable().optional(),
  internalNotes: z.string().min(1).optional(),
  refundReason: z.string().min(1).nullable().optional(),
  updatedAt: timestampSchema,
});

export const orderAccessInputSchema = z.object({
  orderId: idSchema,
  emailToken: z.string().min(1),
});

export const adminOrderIdInputSchema = z.object({
  orderId: idSchema,
});

export const adminOrderListInputSchema = cursorPaginationInputSchema;

export const adminOrderStatusInputSchema = z.object({
  orderId: idSchema,
  status: orderStatusSchema,
});

export const adminOrderTrackingInputSchema = z.object({
  orderId: idSchema,
  trackingCarrier: z.string().min(1),
  trackingNumber: z.string().min(1),
});

export const productPageSchema = paginatedResponseSchema(productSchema);
export const adminProductPageSchema = paginatedResponseSchema(adminProductSchema);
export const adminOrderPageSchema = paginatedResponseSchema(adminOrderSchema);
