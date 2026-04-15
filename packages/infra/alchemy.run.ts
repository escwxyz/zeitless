// oxlint-disable typescript/no-non-null-assertion
import alchemy from "alchemy";
import {
  Astro,
  D1Database,
  DurableObjectNamespace,
  R2Bucket,
  TanStackStart,
  Worker,
} from "alchemy/cloudflare";

import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("zeitless");

const db = await D1Database("database", {
  migrationsDir: "../../packages/db/src/migrations",
  adopt: true,
});

const productImages = await R2Bucket("product-images", {
  name: "zeitless-product-images",
});

const productState = DurableObjectNamespace("product-state", {
  className: "ProductState",
  sqlite: true,
});

const cartState = DurableObjectNamespace("cart-state", {
  className: "CartState",
  sqlite: true,
});

const reservationState = DurableObjectNamespace("reservation-state", {
  className: "ReservationState",
  sqlite: true,
});

export const web = await Astro("web", {
  cwd: "../../apps/web",
  entrypoint: "dist/server/entry.mjs",
  assets: "dist/client",
  bindings: {
    PUBLIC_SERVER_URL: alchemy.env.PUBLIC_SERVER_URL!,
  },
});

export const dashboard = await TanStackStart("dashboard", {
  cwd: "../../apps/dashboard",
});

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    IMAGES: productImages,
    PRODUCT_STATE: productState,
    CART_STATE: cartState,
    RESERVATION_STATE: reservationState,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    RESEND_API_KEY: alchemy.secret.env.RESEND_API_KEY!,
    STRIPE_SECRET_KEY: alchemy.secret.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: alchemy.secret.env.STRIPE_WEBHOOK_SECRET!,
    REFUND_WINDOW_MS: alchemy.env.REFUND_WINDOW_MS!,
  },
  dev: {
    port: 3000,
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Dashboard -> ${dashboard.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
