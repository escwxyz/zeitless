import { createDb } from "@zeitless/db";
import * as schema from "@zeitless/db/schema/auth";
import { env } from "@zeitless/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, bearer } from "better-auth/plugins";
import { nanoid } from "nanoid";

export function createAuth() {
  const db = createDb(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
      usePlural: true,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
    // session: {
    //   cookieCache: {
    //     enabled: true,
    //     maxAge: 60,
    //   },
    // },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/auth",
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
      database: {
        generateId: () => nanoid(),
      },
      // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
      // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
      // crossSubDomainCookies: {
      //   enabled: true,
      //   domain: "<your-workers-subdomain>",
      // },
    },
    socialProviders: {
      // google: {
      //   clientId: env.GOOGLE_CLIENT_ID,
      //   clientSecret: env.GOOGLE_CLIENT_SECRET,
      // },
    },
    plugins: [bearer(), adminPlugin()],
  });
}

export const auth = createAuth();
