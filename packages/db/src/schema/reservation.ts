import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { product } from "./product";
import { baseTableColumns } from "../utils";
import type { ReservationId } from "../utils";

const reservationBaseColumns = baseTableColumns<ReservationId>();

export const reservation = sqliteTable(
  "reservations",
  {
    ...reservationBaseColumns,
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    status: text("status", {
      enum: ["available", "reserved", "sold"],
    })
      .default("reserved")
      .notNull(),
    reservedUntil: integer("reserved_until", { mode: "timestamp_ms" }).notNull(),
    releasedAt: integer("released_at", { mode: "timestamp_ms" }),
    cartId: text("cart_id"),
  },
  (table) => [
    index("reservation_product_id_idx").on(table.productId),
    index("reservation_email_idx").on(table.email),
    index("reservation_status_idx").on(table.status),
    index("reservation_reserved_until_idx").on(table.reservedUntil),
  ],
);
