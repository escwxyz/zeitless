import { env } from "@zeitless/env/dashboard";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const authBaseUrl = new URL("/auth", env.VITE_SERVER_URL).toString();

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [adminClient()],
});
