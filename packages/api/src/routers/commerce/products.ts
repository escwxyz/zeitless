import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, lt, or } from "drizzle-orm";
import type { productPageSchema, productSchema } from "@zeitless/contract";
import { asProductId, createDb } from "@zeitless/db";
import { product as productTable } from "@zeitless/db/schema";
import type { z } from "zod";

import type { CommerceBindings, ProductRow } from "./shared";
import { toProduct } from "./shared";

type Product = z.infer<typeof productSchema>;
type ProductPage = z.infer<typeof productPageSchema>;

interface ProductListInput {
  brand?: string;
  category?: string;
  condition?: "new" | "pre-owned";
  cursor?: string;
  limit: number;
}

interface ProductIdInput {
  productId: string;
}

const encodeCursor = (row: ProductRow) => `${row.createdAt.getTime()}:${row.id}`;

const decodeCursor = (cursor: string) => {
  const separatorIndex = cursor.indexOf(":");

  if (separatorIndex <= 0) {
    throw new ORPCError("BAD_REQUEST");
  }

  const createdAt = Number(cursor.slice(0, separatorIndex));
  const id = cursor.slice(separatorIndex + 1);

  if (!Number.isFinite(createdAt) || id.length === 0) {
    throw new ORPCError("BAD_REQUEST");
  }

  return {
    createdAt: new Date(createdAt),
    id: asProductId(id),
  };
};

const buildProductFilters = (input: ProductListInput) => {
  const filters = [eq(productTable.draft, false)];

  if (input.brand) {
    filters.push(eq(productTable.brand, input.brand));
  }

  if (input.category) {
    filters.push(eq(productTable.category, input.category));
  }

  if (input.condition) {
    filters.push(eq(productTable.condition, input.condition));
  }

  return filters;
};

const buildProductCursorFilter = (cursor: string | undefined) => {
  if (!cursor) {
    return;
  }

  const decodedCursor = decodeCursor(cursor);

  return or(
    lt(productTable.createdAt, decodedCursor.createdAt),
    and(eq(productTable.createdAt, decodedCursor.createdAt), lt(productTable.id, decodedCursor.id)),
  );
};

export const listProducts = async (
  bindings: CommerceBindings,
  input: ProductListInput,
): Promise<ProductPage> => {
  const db = createDb(bindings.DB);
  const baseFilters = buildProductFilters(input);
  const cursorFilter = buildProductCursorFilter(input.cursor);
  const whereClause = cursorFilter ? and(...baseFilters, cursorFilter) : and(...baseFilters);
  const totalCountResult = await db
    .select({
      value: count(),
    })
    .from(productTable)
    .where(and(...baseFilters));

  const rows = await db
    .select()
    .from(productTable)
    .where(whereClause)
    .orderBy(desc(productTable.createdAt), desc(productTable.id))
    .limit(input.limit + 1);

  const hasMore = rows.length > input.limit;
  const pageRows = hasMore ? rows.slice(0, input.limit) : rows;
  const lastRow = pageRows.at(-1);

  return {
    items: pageRows.map(toProduct),
    nextCursor: hasMore && lastRow ? encodeCursor(lastRow) : null,
    totalCount: totalCountResult[0]?.value ?? 0,
  };
};

export const getProduct = async (
  bindings: CommerceBindings,
  { productId }: ProductIdInput,
): Promise<Product> => {
  const db = createDb(bindings.DB);
  const [row] = await db
    .select()
    .from(productTable)
    .where(and(eq(productTable.id, asProductId(productId)), eq(productTable.draft, false)))
    .limit(1);

  if (!row) {
    throw new ORPCError("NOT_FOUND");
  }

  return toProduct(row);
};
