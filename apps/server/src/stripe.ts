import StripeClient from "stripe";
import { eq } from "drizzle-orm";

import { asReservationId, createDb } from "@zeitless/db";
import { reservation as reservationTable } from "@zeitless/db/schema";

import {
  markOrderCancelledById,
  markOrderPaid,
  updateOrderStripePaymentIntentId,
} from "@zeitless/api/routers/commerce/orders";

interface StripeCheckoutBindings {
  CORS_ORIGIN: string;
  STRIPE_SECRET_KEY: string;
}

interface StripeCheckoutProduct {
  title: string;
  brand: string;
  description: string;
  images: { url: string }[];
  price: number;
  currency: string;
}

interface CreateHostedCheckoutSessionInput {
  orderId: string;
  reservationId: string;
  cartId: string;
  email: string;
  product: StripeCheckoutProduct;
}

interface HostedCheckoutSession {
  id: string;
  url: string;
}

interface DurableObjectStubLike {
  fetch(request: Request): Promise<Response>;
}

interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStubLike;
}

const getStripeClient = (bindings: Env) => new StripeClient(bindings.STRIPE_SECRET_KEY);

const getCheckoutStripeClient = (bindings: StripeCheckoutBindings) =>
  new StripeClient(bindings.STRIPE_SECRET_KEY);

const buildCheckoutRedirectUrl = (baseUrl: string, path: string) =>
  new URL(path, baseUrl).toString();

export const createHostedCheckoutSession = async (
  bindings: StripeCheckoutBindings,
  input: CreateHostedCheckoutSessionInput,
): Promise<HostedCheckoutSession> => {
  const stripe = getCheckoutStripeClient(bindings);
  const successUrl = buildCheckoutRedirectUrl(
    bindings.CORS_ORIGIN,
    `/?checkout=success&orderId=${input.orderId}&session_id={CHECKOUT_SESSION_ID}`,
  );
  const cancelUrl = buildCheckoutRedirectUrl(
    bindings.CORS_ORIGIN,
    `/?checkout=cancel&orderId=${input.orderId}`,
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: input.orderId,
      reservationId: input.reservationId,
      cartId: input.cartId,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.product.currency.toLowerCase(),
          unit_amount: input.product.price,
          product_data: {
            name: `${input.product.brand} ${input.product.title}`,
            description: input.product.description,
            images: input.product.images.map((image) => image.url).slice(0, 8),
          },
        },
      },
    ],
  });

  if (!session.url) {
    throw new Error("Stripe Checkout Session did not return a URL.");
  }

  return {
    id: session.id,
    url: session.url,
  };
};

const getReservationStub = (env: Env, productId: string) =>
  (env.RESERVATION_STATE as unknown as DurableObjectNamespaceLike).get(
    (env.RESERVATION_STATE as unknown as DurableObjectNamespaceLike).idFromName(productId),
  );

const callReservationAction = async (
  env: Env,
  reservationId: string,
  action: "sell" | "release",
) => {
  const db = createDb(env.DB);
  const [row] = await db
    .select({
      productId: reservationTable.productId,
    })
    .from(reservationTable)
    .where(eq(reservationTable.id, asReservationId(reservationId)))
    .limit(1);

  if (!row) {
    throw new Error("Reservation not found for Stripe webhook.");
  }

  const response = await getReservationStub(env, row.productId).fetch(
    new Request(`https://durable-object.local/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reservationId }),
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to ${action} reservation ${reservationId}.`);
  }
};

const getStripeWebhookEvent = async (request: Request, env: Env) => {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    throw new Error("Missing Stripe signature header.");
  }

  const stripe = getStripeClient(env);

  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
};

const getMetadataValue = (metadata: StripeClient.Metadata | null | undefined, key: string) => {
  const value = metadata?.[key];

  if (!value) {
    throw new Error(`Missing Stripe metadata field: ${key}`);
  }

  return value;
};

const finalizePaidCheckout = async (env: Env, session: StripeClient.Checkout.Session) => {
  const orderId = getMetadataValue(session.metadata, "orderId");
  const reservationId = getMetadataValue(session.metadata, "reservationId");
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  await callReservationAction(env, reservationId, "sell");
  if (paymentIntentId) {
    await updateOrderStripePaymentIntentId(env, orderId, paymentIntentId);
  }

  await markOrderPaid(env, orderId, paymentIntentId);
};

const finalizeFailedCheckout = async (env: Env, session: StripeClient.Checkout.Session) => {
  const orderId = getMetadataValue(session.metadata, "orderId");
  const reservationId = getMetadataValue(session.metadata, "reservationId");

  await callReservationAction(env, reservationId, "release");
  await markOrderCancelledById(env, orderId);
};

export const handleStripeWebhook = async (request: Request, env: Env): Promise<Response> => {
  let event: StripeClient.Event;

  try {
    event = await getStripeWebhookEvent(request, env);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook.";
    return new Response(message, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      await finalizePaidCheckout(env, event.data.object as StripeClient.Checkout.Session);
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      await finalizePaidCheckout(env, event.data.object as StripeClient.Checkout.Session);
      break;
    }
    case "checkout.session.async_payment_failed": {
      await finalizeFailedCheckout(env, event.data.object as StripeClient.Checkout.Session);
      break;
    }
    default: {
      break;
    }
  }

  return Response.json({ received: true });
};
