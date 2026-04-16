import {
  adminOrderIdInputSchema,
  adminOrderPageSchema,
  adminOrderSchema,
  adminOrderStatusInputSchema,
  adminOrderTrackingInputSchema,
  adminOrderListInputSchema,
  adminProductListInputSchema,
  adminProductPageSchema,
  adminProductPatchSchema,
  adminProductSchema,
  adminProductWriteSchema,
  contract,
  productIdInputSchema,
} from "../common";

const adminTags = {
  order: ["order"],
  product: ["product"],
} as const;

export const adminContracts = {
  product: {
    list: contract
      .route({
        method: "GET",
        path: "/v1/admin/products",
        tags: adminTags.product,
        description: "List products for admin management.",
      })
      .input(adminProductListInputSchema)
      .output(adminProductPageSchema),
    detail: contract
      .route({
        method: "GET",
        path: "/v1/admin/products/{productId}",
        tags: adminTags.product,
        description: "Fetch a product with internal admin fields.",
      })
      .input(productIdInputSchema)
      .output(adminProductSchema),
    create: contract
      .route({
        method: "POST",
        path: "/v1/admin/products",
        tags: adminTags.product,
        description: "Create a new product in the admin console.",
        successStatus: 201,
      })
      .input(adminProductWriteSchema)
      .output(adminProductSchema),
    update: contract
      .route({
        method: "PATCH",
        path: "/v1/admin/products/{productId}",
        tags: adminTags.product,
        description: "Update an existing product in the admin console.",
      })
      .input(
        productIdInputSchema.extend({
          changes: adminProductPatchSchema,
        }),
      )
      .output(adminProductSchema),
  },
  order: {
    list: contract
      .route({
        method: "GET",
        path: "/v1/admin/orders",
        tags: adminTags.order,
        description: "List all orders for admin review.",
      })
      .input(adminOrderListInputSchema)
      .output(adminOrderPageSchema),
    detail: contract
      .route({
        method: "GET",
        path: "/v1/admin/orders/{orderId}",
        tags: adminTags.order,
        description: "Fetch a single order with admin-only metadata.",
      })
      .input(adminOrderIdInputSchema)
      .output(adminOrderSchema),
    updateStatus: contract
      .route({
        method: "PATCH",
        path: "/v1/admin/orders/{orderId}/status",
        tags: adminTags.order,
        description: "Update the operational status of an order.",
      })
      .input(adminOrderStatusInputSchema)
      .output(adminOrderSchema),
    updateTracking: contract
      .route({
        method: "PATCH",
        path: "/v1/admin/orders/{orderId}/tracking",
        tags: adminTags.order,
        description: "Attach tracking information to an order.",
      })
      .input(adminOrderTrackingInputSchema)
      .output(adminOrderSchema),
  },
} as const;
