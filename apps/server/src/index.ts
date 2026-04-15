// oxlint-disable promise/prefer-await-to-callbacks
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createContext } from "@zeitless/api/context";
import { appRouter } from "@zeitless/api/routers";
import { createAuth } from "@zeitless/auth";
import { env } from "@zeitless/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { handleStripeWebhook } from "./stripe";

export { CartState } from "./durable-objects/cart-state";
export { ProductState } from "./durable-objects/product-state";
export { ReservationState } from "./durable-objects/reservation-state";

const AUTH_PREFIX = "/auth";
const RPC_PREFIX = "/rpc";

const app = new Hono<{ Bindings: Env }>();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Better Auth is exposed on the platform API origin at /auth/*.
app.on(["POST", "GET"], `${AUTH_PREFIX}/*`, (c) => createAuth().handler(c.req.raw));
app.post("/v1/webhooks/stripe", (c) => handleStripeWebhook(c.req.raw, c.env));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      docsPath: "/docs",
      specGenerateOptions: {
        info: {
          title: "OpenAPI References",
          version: "1.0.0",
        },
      },
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  // RPC stays separate for the dashboard app and other typed internal consumers.
  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: RPC_PREFIX,
    context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    // prefix: "/api-reference",
    context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => c.text("OK"));

const server = {
  fetch: (request: Request, workerEnv: Env, executionContext: ExecutionContext) =>
    app.fetch(request, workerEnv, executionContext),
  // queue: (batch: MessageBatch<unknown>) => processMatchEventBatch(batch),
};

export default server satisfies ExportedHandler<Env, unknown>;
