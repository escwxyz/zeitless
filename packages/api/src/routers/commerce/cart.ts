import type {
  cartSchema,
  checkoutSessionSchema,
  checkoutStartInputSchema,
  cartIdInputSchema,
  cartItemInputSchema,
} from "@zeitless/contract";
import type { z } from "zod";

import type { CommerceBindings } from "./shared";
import { fetchCartDo, toJsonBody } from "./do";

type Cart = z.infer<typeof cartSchema>;
type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
type CheckoutStartInput = z.infer<typeof checkoutStartInputSchema>;
type CartIdInput = z.infer<typeof cartIdInputSchema>;
type CartItemInput = z.infer<typeof cartItemInputSchema>;

export const getCart = (bindings: CommerceBindings, input: CartIdInput): Promise<Cart> =>
  fetchCartDo<Cart>(bindings, input.cartId, "/");

export const addCartItem = (bindings: CommerceBindings, input: CartItemInput): Promise<Cart> =>
  fetchCartDo<Cart>(bindings, input.cartId, "/items", {
    method: "POST",
    body: toJsonBody({ productId: input.productId }),
  });

export const removeCartItem = (bindings: CommerceBindings, input: CartItemInput): Promise<Cart> =>
  fetchCartDo<Cart>(bindings, input.cartId, `/items/${encodeURIComponent(input.productId)}`, {
    method: "DELETE",
  });

export const clearCart = (bindings: CommerceBindings, input: CartIdInput): Promise<Cart> =>
  fetchCartDo<Cart>(bindings, input.cartId, "/", {
    method: "DELETE",
  });

export const startCheckout = (
  bindings: CommerceBindings,
  input: CheckoutStartInput,
): Promise<CheckoutSession> =>
  fetchCartDo<CheckoutSession>(bindings, input.cartId, "/checkout", {
    method: "POST",
    body: toJsonBody({
      email: input.email,
      shippingAddress: input.shippingAddress,
    }),
  });
