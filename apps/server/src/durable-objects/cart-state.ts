import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import type {
  cartSchema,
  checkoutSessionSchema,
  checkoutStartInputSchema,
  reservationSchema,
} from "@zeitless/contract";
import { DurableObject } from "cloudflare:workers";
import { asProductId, createDb } from "@zeitless/db";
import { product as productTable } from "@zeitless/db/schema";
import { z } from "zod";

import {
  createOrderRecord,
  deleteOrderById,
  updateOrderStripeCheckoutSessionId,
} from "@zeitless/api/routers/commerce/orders";
import { toCart, toCartItem, toCheckoutSession } from "@zeitless/api/routers/commerce/shared";
import type { CommerceBindings } from "@zeitless/api/routers/commerce/shared";
import { createHostedCheckoutSession } from "../stripe";

type Cart = z.infer<typeof cartSchema>;
type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
type CheckoutStartInput = z.infer<typeof checkoutStartInputSchema>;
type Reservation = z.infer<typeof reservationSchema>;

interface StoredCheckout {
  session: CheckoutSession;
  productId: string;
  shippingAddress: CheckoutStartInput["shippingAddress"];
}

interface CartDocument {
  cart: Cart;
  checkout: StoredCheckout | null;
}

interface DurableObjectStubLike {
  fetch(request: Request): Promise<Response>;
}

interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStubLike;
}

const cartBodySchema = z.object({
  productId: z.string().min(1),
});

const checkoutBodySchema = z.object({
  email: z.email(),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().min(1).optional(),
    city: z.string().min(1),
    region: z.string().min(1).optional(),
    postalCode: z.string().min(1),
    country: z.string().min(2),
    phone: z.string().min(1).optional(),
  }),
});

const jsonResponse = (body: unknown, status = 200) => Response.json(body, { status });

const getCartId = (state: DurableObjectState): string => {
  if (!state.id.name) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  return state.id.name;
};

const getTimestamp = () => new Date();

const getReservationStub = (env: Env, productId: string) =>
  // Each product gets its own reservation coordinator DO.
  (env.RESERVATION_STATE as unknown as DurableObjectNamespaceLike).get(
    (env.RESERVATION_STATE as unknown as DurableObjectNamespaceLike).idFromName(productId),
  );

const fetchReservationJson = async <T>(
  env: Env,
  productId: string,
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await getReservationStub(env, productId).fetch(
    new Request(`https://durable-object.local${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    }),
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new ORPCError("NOT_FOUND");
    }

    if (response.status === 409) {
      throw new ORPCError("CONFLICT");
    }

    if (response.status === 400) {
      throw new ORPCError("BAD_REQUEST");
    }

    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  return (await response.json()) as T;
};

const fetchReservationMaybeJson = async <T>(
  env: Env,
  productId: string,
  path: string,
  init?: RequestInit,
): Promise<T | null> => {
  const response = await getReservationStub(env, productId).fetch(
    new Request(`https://durable-object.local${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    }),
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    if (response.status === 409) {
      throw new ORPCError("CONFLICT");
    }

    if (response.status === 400) {
      throw new ORPCError("BAD_REQUEST");
    }

    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  return (await response.json()) as T;
};

const getProductRow = async (
  db: ReturnType<typeof createDb>,
  productId: string,
): Promise<typeof productTable.$inferSelect> => {
  const [row] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, asProductId(productId)))
    .limit(1);

  if (!row || row.draft || row.isSold || row.reservationStatus !== "available") {
    throw new ORPCError("CONFLICT");
  }

  return row;
};

const createStripeCheckoutSession = async (
  bindings: CommerceBindings,
  currentItem: Cart["items"][number],
  cartId: string,
  reservationId: string,
  email: string,
  reservedUntil: Date | string,
) => {
  const stripeSession = await createHostedCheckoutSession(bindings, {
    orderId: reservationId,
    reservationId,
    cartId,
    email,
    product: currentItem.product,
  });

  return toCheckoutSession({
    id: crypto.randomUUID(),
    cartId,
    reservationId,
    email,
    status: "reserved",
    reservedUntil,
    totalPrice: currentItem.product.price,
    currency: currentItem.product.currency,
    stripeCheckoutSessionId: stripeSession.id,
    stripeCheckoutUrl: stripeSession.url,
    createdAt: getTimestamp(),
  });
};

export class CartState extends DurableObject<Env> {
  override fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === "GET" && url.pathname === "/") {
      return this.getCart();
    }

    if (method === "POST" && url.pathname === "/items") {
      return this.addItem(request);
    }

    if (method === "DELETE" && url.pathname.startsWith("/items/")) {
      return this.removeItem(url.pathname.slice("/items/".length));
    }

    if (method === "DELETE" && url.pathname === "/") {
      return this.clear();
    }

    if (method === "POST" && url.pathname === "/checkout") {
      return this.startCheckout(request);
    }

    return Promise.resolve(new Response("Not Found", { status: 404 }));
  }

  private async loadDocument(): Promise<CartDocument> {
    const cartId = getCartId(this.ctx);
    const stored = await this.ctx.storage.get<CartDocument>("cart");

    if (stored) {
      return {
        cart: stored.cart,
        checkout: stored.checkout ?? null,
      };
    }

    return {
      cart: toCart({
        id: cartId,
        email: null,
        items: [],
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      }),
      checkout: null,
    };
  }

  private async saveDocument(document: CartDocument): Promise<void> {
    await this.ctx.storage.put("cart", document);
  }

  private getCurrentReservation(productId: string): Promise<Reservation | null> {
    return fetchReservationMaybeJson<Reservation>(this.env, productId, "/");
  }

  private async releaseReservation(productId: string): Promise<void> {
    const current = await this.getCurrentReservation(productId);

    if (!current) {
      return;
    }

    await fetchReservationJson<Reservation>(this.env, productId, "/release", {
      method: "POST",
      body: JSON.stringify({
        reservationId: current.id,
      }),
    });
  }

  private getProduct(productId: string): Promise<typeof productTable.$inferSelect> {
    const db = createDb(this.env.DB);
    return getProductRow(db, productId);
  }

  private async getCart(): Promise<Response> {
    const document = await this.loadDocument();
    return jsonResponse(document.cart);
  }

  private async addItem(request: Request): Promise<Response> {
    const body = cartBodySchema.parse(await request.json());
    const document = await this.loadDocument();
    const now = getTimestamp();
    const currentItem = document.cart.items.at(0);

    // Re-adding the same product is a no-op; keep the cart timestamp fresh.
    if (currentItem?.product.id === body.productId) {
      document.cart = toCart({
        ...document.cart,
        updatedAt: now,
      });
      await this.saveDocument(document);
      return jsonResponse(document.cart);
    }

    const productRow = await this.getProduct(body.productId);
    const item = toCartItem(productRow, now);

    // Switching products must release the old reservation before claiming the new one.
    if (currentItem && currentItem.product.id !== productRow.id) {
      await this.releaseReservation(currentItem.product.id);
      document.checkout = null;
    }

    document.cart = toCart({
      ...document.cart,
      items: [item],
      updatedAt: now,
    });
    await this.saveDocument(document);
    return jsonResponse(document.cart);
  }

  private async removeItem(productId: string): Promise<Response> {
    const document = await this.loadDocument();
    const currentItem = document.cart.items.at(0);

    if (!currentItem || currentItem.product.id !== productId) {
      return jsonResponse(document.cart);
    }

    await this.releaseReservation(productId);
    document.checkout = null;
    document.cart = toCart({
      ...document.cart,
      email: null,
      items: [],
      updatedAt: getTimestamp(),
    });
    await this.saveDocument(document);
    return jsonResponse(document.cart);
  }

  private async clear(): Promise<Response> {
    const document = await this.loadDocument();
    const currentItem = document.cart.items.at(0);

    if (currentItem) {
      await this.releaseReservation(currentItem.product.id);
    }

    document.checkout = null;
    document.cart = toCart({
      ...document.cart,
      email: null,
      items: [],
      updatedAt: getTimestamp(),
    });
    await this.saveDocument(document);
    return jsonResponse(document.cart);
  }

  private async startCheckout(request: Request): Promise<Response> {
    const body = checkoutBodySchema.parse(await request.json());
    const document = await this.loadDocument();
    const currentItem = document.cart.items.at(0);
    const bindings = this.env as CommerceBindings;

    if (!currentItem) {
      throw new ORPCError("CONFLICT");
    }

    if (document.cart.email && document.cart.email !== body.email) {
      throw new ORPCError("CONFLICT");
    }

    const activeReservation = await this.getCurrentReservation(currentItem.product.id);

    // If the reservation already exists for this cart/email, reuse the checkout session.
    if (activeReservation) {
      if (activeReservation.email !== body.email) {
        throw new ORPCError("CONFLICT");
      }

      if (
        document.checkout &&
        document.checkout.productId === currentItem.product.id &&
        document.checkout.session.email === body.email &&
        document.checkout.session.reservationId === activeReservation.id
      ) {
        return jsonResponse(document.checkout.session);
      }

      let orderResult;

      try {
        orderResult = await createOrderRecord(bindings, {
          reservationId: activeReservation.id,
          shippingInfo: body.shippingAddress,
        });
      } catch (error) {
        await this.releaseReservation(currentItem.product.id);
        throw error;
      }

      try {
        const session = await createStripeCheckoutSession(
          bindings,
          currentItem,
          document.cart.id,
          activeReservation.id,
          body.email,
          activeReservation.reservedUntil,
        );
        await updateOrderStripeCheckoutSessionId(bindings, activeReservation.id, session.id);

        document.cart = toCart({
          ...document.cart,
          email: body.email,
          updatedAt: getTimestamp(),
        });
        document.checkout = {
          session,
          productId: currentItem.product.id,
          shippingAddress: body.shippingAddress,
        };
        await this.saveDocument(document);
        return jsonResponse(session);
      } catch (error) {
        if (orderResult.created) {
          await deleteOrderById(bindings, activeReservation.id);
          await this.releaseReservation(currentItem.product.id);
        }
        throw error;
      }
    }

    if (
      document.checkout &&
      document.checkout.productId === currentItem.product.id &&
      document.checkout.session.email === body.email
    ) {
      document.checkout = null;
    }

    const reservation = await fetchReservationJson<Reservation>(
      this.env,
      currentItem.product.id,
      "/reserve",
      {
        method: "POST",
        body: JSON.stringify({
          email: body.email,
          cartId: document.cart.id,
        }),
      },
    );

    let orderResult;

    try {
      orderResult = await createOrderRecord(bindings, {
        reservationId: reservation.id,
        shippingInfo: body.shippingAddress,
      });
    } catch (error) {
      await this.releaseReservation(currentItem.product.id);
      throw error;
    }

    try {
      const session = await createStripeCheckoutSession(
        bindings,
        currentItem,
        document.cart.id,
        reservation.id,
        body.email,
        reservation.reservedUntil,
      );
      await updateOrderStripeCheckoutSessionId(bindings, reservation.id, session.id);

      document.cart = toCart({
        ...document.cart,
        email: body.email,
        updatedAt: getTimestamp(),
      });
      document.checkout = {
        session,
        productId: currentItem.product.id,
        shippingAddress: body.shippingAddress,
      };
      await this.saveDocument(document);
      return jsonResponse(session, 201);
    } catch (error) {
      if (orderResult.created) {
        await deleteOrderById(bindings, reservation.id);
        await this.releaseReservation(currentItem.product.id);
      }
      throw error;
    }
  }
}
