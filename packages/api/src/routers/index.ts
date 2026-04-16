import type { RouterClient } from "@orpc/server";

import { commerce as contractCommerce } from "./app/base";
import {
  addCartItem,
  cancelOrder,
  clearCart,
  createReservation,
  createOrder,
  expireReservation,
  getCart,
  getOrder,
  getProduct,
  listProducts,
  removeCartItem,
  releaseReservationById,
  startCheckout,
} from "./commerce";

export const appRouter = {
  product: {
    list: contractCommerce.product.list.handler(({ context, input }) =>
      listProducts(context.bindings, input),
    ),
    detail: contractCommerce.product.detail.handler(({ context, input }) =>
      getProduct(context.bindings, input),
    ),
  },
  reservation: {
    create: contractCommerce.reservation.create.handler(({ context, input }) =>
      createReservation(context.bindings, input),
    ),
    release: contractCommerce.reservation.release.handler(({ context, input }) =>
      releaseReservationById(context.bindings, input),
    ),
    expire: contractCommerce.reservation.expire.handler(({ context, input }) =>
      expireReservation(context.bindings, input),
    ),
  },
  cart: {
    get: contractCommerce.cart.get.handler(({ context, input }) =>
      getCart(context.bindings, input),
    ),
    addItem: contractCommerce.cart.addItem.handler(({ context, input }) =>
      addCartItem(context.bindings, input),
    ),
    removeItem: contractCommerce.cart.removeItem.handler(({ context, input }) =>
      removeCartItem(context.bindings, input),
    ),
    clear: contractCommerce.cart.clear.handler(({ context, input }) =>
      clearCart(context.bindings, input),
    ),
  },
  checkout: {
    start: contractCommerce.checkout.start.handler(({ context, input }) =>
      startCheckout(context.bindings, input),
    ),
  },
  order: {
    create: contractCommerce.order.create.handler(({ context, input }) =>
      createOrder(context.bindings, input),
    ),
    get: contractCommerce.order.get.handler(({ context, input }) =>
      getOrder(context.bindings, input),
    ),
    cancel: contractCommerce.order.cancel.handler(({ context, input }) =>
      cancelOrder(context.bindings, input),
    ),
  },
} as const;

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;

export const commerceRouter = appRouter;
