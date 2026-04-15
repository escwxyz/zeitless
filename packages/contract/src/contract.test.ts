import { describe, expect, test } from "bun:test";

import { commerceContracts } from "./app";
import { adminContracts } from "./admin";
import {
  adminOrderSchema,
  adminProductListInputSchema,
  adminProductPatchSchema,
  adminProductSchema,
  adminProductWriteSchema,
  buyerOrderSchema,
  orderStatusSchema,
  productSchema,
  productListInputSchema,
} from "./common";

describe("@zeitless/contract", () => {
  test("keeps the phase-1 commerce contract surface organized by domain", () => {
    expect(Object.keys(commerceContracts)).toEqual([
      "product",
      "reservation",
      "cart",
      "checkout",
      "order",
    ]);

    expect(commerceContracts.product.list).toBeTruthy();
    expect(commerceContracts.product.detail).toBeTruthy();
    expect(commerceContracts.reservation.create).toBeTruthy();
    expect(commerceContracts.cart.get).toBeTruthy();
    expect(commerceContracts.checkout.start).toBeTruthy();
    expect(commerceContracts.order.create).toBeTruthy();
    expect(commerceContracts.order.get).toBeTruthy();
  });

  test("keeps admin contracts separate from the buyer-facing surface", () => {
    expect(Object.keys(adminContracts)).toEqual(["product", "order"]);

    expect(Object.keys(adminContracts.product)).toEqual(["list", "detail", "create", "update"]);
    expect(adminContracts.product.create).toBeTruthy();
    expect(adminContracts.product.update).toBeTruthy();
    expect(adminContracts.order.updateTracking).toBeTruthy();
  });

  test("uses a distinct admin product list query schema with lifecycle filters", () => {
    const adminListQuery = adminProductListInputSchema.parse({
      limit: 10,
      publicationState: "published",
      inventoryState: "sold",
    });

    const publicListQuery = productListInputSchema.parse({
      limit: 10,
      publicationState: "published",
      inventoryState: "sold",
    });

    expect(adminListQuery).toHaveProperty("publicationState", "published");
    expect(adminListQuery).toHaveProperty("inventoryState", "sold");
    expect(publicListQuery).not.toHaveProperty("publicationState");
    expect(publicListQuery).not.toHaveProperty("inventoryState");
  });

  test("strips admin-only fields from buyer-facing product output", () => {
    const publicProduct = productSchema.parse({
      id: "product_01",
      title: "Archive Blazer",
      brand: "Zeitless",
      category: "outerwear",
      condition: "pre-owned",
      size: "M",
      price: 18_000,
      currency: "USD",
      description: "A sharply cut archival blazer.",
      images: [{ url: "https://example.com/blazer.jpg", alt: "Archive blazer" }],
      isSold: false,
      reservationStatus: "available",
      reservedUntil: null,
      createdAt: "2026-04-14T15:31:27.000Z",
    });

    expect(publicProduct).not.toHaveProperty("internalNotes");
    expect(publicProduct).not.toHaveProperty("draft");
    expect(publicProduct).not.toHaveProperty("costPrice");
  });

  test("admits admin-only product fields on the admin schema", () => {
    const adminProduct = adminProductSchema.parse({
      id: "product_01",
      title: "Archive Blazer",
      brand: "Zeitless",
      category: "outerwear",
      condition: "pre-owned",
      size: "M",
      price: 18_000,
      currency: "USD",
      description: "A sharply cut archival blazer.",
      images: [{ url: "https://example.com/blazer.jpg", alt: "Archive blazer" }],
      isSold: false,
      reservationStatus: "available",
      reservedUntil: null,
      createdAt: "2026-04-14T15:31:27.000Z",
      costPrice: 9600,
      draft: true,
      internalNotes: "Hold for editorial review.",
      internalTags: ["editorial", "archive"],
      publishedAt: null,
      updatedBy: null,
    });

    expect(adminProduct).toHaveProperty("internalNotes", "Hold for editorial review.");
    expect(adminProduct).toHaveProperty("draft", true);
  });

  test("defaults admin product creation to draft", () => {
    const createdProduct = adminProductWriteSchema.parse({
      title: "Archive Blazer",
      brand: "Zeitless",
      category: "outerwear",
      condition: "pre-owned",
      size: "M",
      price: 18_000,
      currency: "USD",
      description: "A sharply cut archival blazer.",
      images: [{ url: "https://example.com/blazer.jpg", alt: "Archive blazer" }],
    });

    expect(createdProduct).toHaveProperty("draft", true);
    expect(createdProduct).toHaveProperty("internalTags", []);
  });

  test("keeps admin product patches optional without forcing draft defaults", () => {
    const patch = adminProductPatchSchema.parse({
      title: "Reworked blazer",
    });

    expect(patch).toHaveProperty("title", "Reworked blazer");
    expect(patch).not.toHaveProperty("draft");
  });

  test("uses the phase-1 order lifecycle status model", () => {
    expect(orderStatusSchema.options).toEqual([
      "reserved",
      "paid",
      "cancelled",
      "shipped",
      "completed",
    ]);
  });

  test("supports buyer and admin order schemas", () => {
    const buyerOrder = buyerOrderSchema.parse({
      id: "order_01",
      email: "buyer@example.com",
      items: [
        {
          productId: "product_01",
          title: "Archive Blazer",
          brand: "Zeitless",
          size: "M",
          price: 18_000,
          currency: "USD",
        },
      ],
      totalPrice: 18_000,
      currency: "USD",
      status: "reserved",
      shippingInfo: {
        fullName: "Buyer Name",
        line1: "123 Example Street",
        city: "Berlin",
        postalCode: "10115",
        country: "DE",
      },
      reservedAt: "2026-04-14T15:31:27.000Z",
      reservedUntil: "2026-04-14T16:01:27.000Z",
      paidAt: null,
      cancelledAt: null,
      refundedAt: null,
      createdAt: "2026-04-14T15:31:27.000Z",
    });

    const adminOrder = adminOrderSchema.parse({
      ...buyerOrder,
      trackingCarrier: "DHL",
      trackingNumber: "TRACK123",
      internalNotes: "Customer requested silent packaging.",
      refundReason: null,
      updatedAt: "2026-04-14T15:31:27.000Z",
    });

    expect(buyerOrder.status).toBe("reserved");
    expect(adminOrder).toHaveProperty("trackingNumber", "TRACK123");
  });
});
