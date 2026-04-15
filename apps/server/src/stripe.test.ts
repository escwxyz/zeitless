/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { buildCheckoutRedirectUrl } from "./stripe";

describe("buildCheckoutRedirectUrl", () => {
  test("joins the storefront origin with checkout routes", () => {
    expect(
      buildCheckoutRedirectUrl(
        "http://localhost:4321",
        "/checkout/complete?orderId=order_123&session_id=session_123",
      ),
    ).toBe("http://localhost:4321/checkout/complete?orderId=order_123&session_id=session_123");
  });
});
