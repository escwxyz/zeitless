import { admin } from "./base";
import {
  createAdminProduct,
  getAdminProduct,
  listAdminProducts,
  updateAdminProduct,
} from "./products";

export const adminRouter = {
  product: {
    list: admin.product.list.handler(({ context, input }) =>
      listAdminProducts(context.bindings, input),
    ),
    detail: admin.product.detail.handler(({ context, input }) =>
      getAdminProduct(context.bindings, input),
    ),
    create: admin.product.create.handler(({ context, input }) =>
      createAdminProduct(context.bindings, input),
    ),
    update: admin.product.update.handler(({ context, input }) =>
      updateAdminProduct(context.bindings, input.productId, input.changes),
    ),
  },
} as const;
