/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { adminRouter } from "./index";

describe("@zeitless/api admin router", () => {
  test("keeps the admin product surface isolated from the public router", () => {
    expect(Object.keys(adminRouter)).toEqual(["product"]);
    expect(Object.keys(adminRouter.product)).toEqual(["list", "detail", "create", "update"]);
  });
});
