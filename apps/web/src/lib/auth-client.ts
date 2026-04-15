import { PUBLIC_SERVER_URL } from "astro:env/client";
import { createAuthClient } from "better-auth/client";

const authBaseUrl = new URL("/auth", PUBLIC_SERVER_URL).toString();

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
});
