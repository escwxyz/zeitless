/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import {
  isNonSoldProduct,
  isSoldOutProduct,
  resolveNullablePatchValue,
  resolvePublishedAt,
} from "./products";

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

  test("keeps omitted nullable patch fields intact while allowing explicit null clears", () => {
    const patch = {};

    expect(resolveNullablePatchValue(patch, "costPrice", 9600)).toBe(9600);
    expect(resolveNullablePatchValue({ costPrice: null }, "costPrice", 9600)).toBeNull();
    expect(resolveNullablePatchValue({ internalNotes: "updated" }, "internalNotes", null)).toBe(
      "updated",
    );
  });
});
