/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { checkoutFormDefaults, checkoutFormSchema } from "./checkout-form-schema";

describe("checkoutFormSchema", () => {
  test("accepts the MVP shipping/contact payload", () => {
    expect(
      checkoutFormSchema.parse({
        ...checkoutFormDefaults,
        fullName: "Evelyn Thorne",
        email: "evelyn@example.com",
        line1: "12 Savile Row",
        city: "London",
        postalCode: "W1S 3PQ",
        country: "United Kingdom",
      }),
    ).toMatchObject({
      fullName: "Evelyn Thorne",
      email: "evelyn@example.com",
      line1: "12 Savile Row",
      city: "London",
      postalCode: "W1S 3PQ",
      country: "United Kingdom",
    });
  });

  test("returns human-readable validation messages", () => {
    const result = checkoutFormSchema.safeParse(checkoutFormDefaults);

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Full name is required.",
        "Please enter a valid email address.",
        "Street address is required.",
        "City is required.",
        "Postal code is required.",
      ]),
    );
  });
});
