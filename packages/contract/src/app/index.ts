import {
  buyerOrderSchema,
  cartIdInputSchema,
  cartItemInputSchema,
  cartSchema,
  checkoutSessionSchema,
  checkoutStartInputSchema,
  contract,
  orderCreateInputSchema,
  orderAccessInputSchema,
  productIdInputSchema,
  productListInputSchema,
  productPageSchema,
  productSchema,
  reservationCreateInputSchema,
  reservationIdInputSchema,
  reservationSchema,
} from "../common";

const commerceTags = {
  cart: ["cart"],
  checkout: ["checkout"],
  order: ["order"],
  product: ["product"],
  reservation: ["reservation"],
} as const;

export const commerceContracts = {
  product: {
    list: contract
      .route({
        method: "GET",
        path: "/v1/products",
        tags: commerceTags.product,
        description: "List public products for the storefront.",
      })
      .input(productListInputSchema)
      .output(productPageSchema),
    detail: contract
      .route({
        method: "GET",
        path: "/v1/products/{productId}",
        tags: commerceTags.product,
        description: "Fetch a single public product by id.",
      })
      .input(productIdInputSchema)
      .output(productSchema),
  },
  reservation: {
    create: contract
      .route({
        method: "POST",
        path: "/v1/reservations",
        tags: commerceTags.reservation,
        description: "Reserve a single product during checkout.",
        successStatus: 201,
      })
      .input(reservationCreateInputSchema)
      .output(reservationSchema),
    release: contract
      .route({
        method: "POST",
        path: "/v1/reservations/{reservationId}/release",
        tags: commerceTags.reservation,
        description: "Release an active reservation back to available inventory.",
      })
      .input(reservationIdInputSchema)
      .output(reservationSchema),
    expire: contract
      .route({
        method: "POST",
        path: "/v1/reservations/{reservationId}/expire",
        tags: commerceTags.reservation,
        description: "Mark a reservation as expired after its hold window closes.",
      })
      .input(reservationIdInputSchema)
      .output(reservationSchema),
  },
  cart: {
    get: contract
      .route({
        method: "GET",
        path: "/v1/carts/{cartId}",
        tags: commerceTags.cart,
        description: "Fetch the current buyer cart.",
      })
      .input(cartIdInputSchema)
      .output(cartSchema),
    addItem: contract
      .route({
        method: "POST",
        path: "/v1/carts/{cartId}/items",
        tags: commerceTags.cart,
        description: "Add a product to the buyer cart.",
      })
      .input(cartItemInputSchema)
      .output(cartSchema),
    removeItem: contract
      .route({
        method: "DELETE",
        path: "/v1/carts/{cartId}/items/{productId}",
        tags: commerceTags.cart,
        description: "Remove a product from the buyer cart.",
      })
      .input(cartItemInputSchema)
      .output(cartSchema),
    clear: contract
      .route({
        method: "DELETE",
        path: "/v1/carts/{cartId}",
        tags: commerceTags.cart,
        description: "Empty the buyer cart.",
      })
      .input(cartIdInputSchema)
      .output(cartSchema),
  },
  checkout: {
    start: contract
      .route({
        method: "POST",
        path: "/v1/checkout",
        tags: commerceTags.checkout,
        description: "Start checkout by reserving the cart contents.",
        successStatus: 201,
      })
      .input(checkoutStartInputSchema)
      .output(checkoutSessionSchema),
  },
  order: {
    create: contract
      .route({
        method: "POST",
        path: "/v1/orders",
        tags: commerceTags.order,
        description: "Create a reserved buyer order from a confirmed reservation.",
        successStatus: 201,
      })
      .input(orderCreateInputSchema)
      .output(buyerOrderSchema),
    get: contract
      .route({
        method: "GET",
        path: "/v1/orders/{orderId}",
        tags: commerceTags.order,
        description: "Fetch a buyer order using the email token.",
      })
      .input(orderAccessInputSchema)
      .output(buyerOrderSchema),
    cancel: contract
      .route({
        method: "POST",
        path: "/v1/orders/{orderId}/cancel",
        tags: commerceTags.order,
        description: "Cancel a paid order within the refund window.",
      })
      .input(orderAccessInputSchema)
      .output(buyerOrderSchema),
  },
} as const;
