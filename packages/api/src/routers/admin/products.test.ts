/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { isNonSoldProduct, isSoldOutProduct, resolvePublishedAt } from "./products";

describe("@zeitless/api admin product helpers", () => {
  test("treats sold products as immutable regardless of draft state", () => {
    expect(isSoldOutProduct({ isSold: true, reservationStatus: "sold" })).toBe(true);
    expect(isSoldOutProduct({ isSold: false, reservationStatus: "sold" })).toBe(true);
    expect(isSoldOutProduct({ isSold: false, reservationStatus: "available" })).toBe(false);
    expect(isNonSoldProduct({ isSold: false, reservationStatus: "reserved" })).toBe(true);
    expect(isNonSoldProduct({ isSold: true, reservationStatus: "available" })).toBe(false);
  });

  test("resolves publication timestamps from the draft state", () => {
    const now = resolvePublishedAt(false, null);

    expect(now).toBeInstanceOf(Date);
    expect(resolvePublishedAt(true, now)).toBeNull();
    expect(resolvePublishedAt(false, now)).toBe(now);
  });
});
