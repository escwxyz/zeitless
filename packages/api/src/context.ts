import { createAuth } from "@zeitless/auth";
import type { Context as HonoContext } from "hono";

type CloudflareBindings = Env;

export interface CreateContextOptions {
  context: HonoContext<{ Bindings: CloudflareBindings }>;
}

export async function createContext({ context }: CreateContextOptions) {
  const session = await createAuth().api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    auth: null,
    bindings: context.env,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
