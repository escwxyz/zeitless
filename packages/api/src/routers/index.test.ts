/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { commerceRouter } from "./index";

describe("@zeitless/api router wiring", () => {
  test("matches the contract-first commerce domains", () => {
    expect(Object.keys(commerceRouter)).toEqual([
      "product",
      "reservation",
      "cart",
      "checkout",
      "order",
    ]);

    expect(Object.keys(commerceRouter.product)).toEqual(["list", "detail"]);
    expect(Object.keys(commerceRouter.reservation)).toEqual(["create", "release", "expire"]);
    expect(Object.keys(commerceRouter.cart)).toEqual(["get", "addItem", "removeItem", "clear"]);
    expect(Object.keys(commerceRouter.checkout)).toEqual(["start"]);
    expect(Object.keys(commerceRouter.order)).toEqual(["create", "get", "cancel"]);
  });
});
