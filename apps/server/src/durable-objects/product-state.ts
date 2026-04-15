import { DurableObject } from "cloudflare:workers";

export class ProductState extends DurableObject {
  fetch(): Response {
    void this.ctx.storage;
    return new Response("ProductState is not implemented yet.", {
      status: 501,
    });
  }
}
