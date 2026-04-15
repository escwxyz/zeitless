import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { baseTableColumns } from "../utils";
import type { ProductId } from "../utils";

interface ProductImage {
  url: string;
  alt?: string;
}

const productBaseColumns = baseTableColumns<ProductId>();

export const product = sqliteTable(
  "products",
  {
    ...productBaseColumns,
    title: text("title").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(),
    condition: text("condition", {
      enum: ["new", "pre-owned"],
    }).notNull(),
    size: text("size").notNull(),
    price: integer("price").notNull(),
    currency: text("currency").notNull(),
    description: text("description").notNull(),
    images: text("images").$type<ProductImage[]>().notNull(),
    isSold: integer("is_sold", { mode: "boolean" }).default(false).notNull(),
    reservationStatus: text("reservation_status", {
      enum: ["available", "reserved", "sold"],
    })
      .default("available")
      .notNull(),
    reservedUntil: integer("reserved_until", { mode: "timestamp_ms" }),
    draft: integer("draft", { mode: "boolean" }).default(true).notNull(),
    costPrice: integer("cost_price"),
    internalNotes: text("internal_notes"),
    internalTags: text("internal_tags").$type<string[]>().notNull(),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("product_brand_idx").on(table.brand),
    index("product_category_idx").on(table.category),
    index("product_condition_idx").on(table.condition),
    index("product_draft_idx").on(table.draft),
    index("product_reservation_status_idx").on(table.reservationStatus),
    index("product_published_at_idx").on(table.publishedAt),
    index("product_created_at_idx").on(table.createdAt),
  ],
);
