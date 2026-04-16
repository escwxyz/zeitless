import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, lt, ne, or } from "drizzle-orm";
import type {
  adminProductListInputSchema,
  adminProductPageSchema,
  adminProductSchema,
  adminProductWriteSchema,
  adminProductPatchSchema,
} from "@zeitless/contract";
import { asProductId, createDb } from "@zeitless/db";
import { product as productTable } from "@zeitless/db/schema";
import type { SQL } from "drizzle-orm";
import type { z } from "zod";

import type { CommerceBindings, ProductRow } from "../commerce/shared";
import { decodeCursor, encodeCursor, toAdminProduct } from "../commerce/shared";

type AdminProduct = z.infer<typeof adminProductSchema>;
type AdminProductPage = z.infer<typeof adminProductPageSchema>;
type AdminProductListInput = z.infer<typeof adminProductListInputSchema>;
type AdminProductWriteInput = z.infer<typeof adminProductWriteSchema>;
type AdminProductPatchInput = z.infer<typeof adminProductPatchSchema>;

export const isSoldOutProduct = (row: Pick<ProductRow, "isSold" | "reservationStatus">) =>
  row.isSold || row.reservationStatus === "sold";

export const isNonSoldProduct = (row: Pick<ProductRow, "isSold" | "reservationStatus">) =>
  !isSoldOutProduct(row);

export const resolvePublishedAt = (draft: boolean, currentPublishedAt: Date | null | undefined) => {
  if (draft) {
    return null;
  }

  return currentPublishedAt ?? new Date();
};

export const resolveNullablePatchValue = <T>(
  patch: object,
  key: string,
  currentValue: T | null,
) => {
  if (!Object.hasOwn(patch, key)) {
    return currentValue;
  }

  const value = (patch as Record<string, T | null | undefined>)[key];

  return value === undefined ? currentValue : value;
};

const buildCursorFilter = (cursor: string | undefined) => {
  if (!cursor) {
    return;
  }

  const decodedCursor = decodeCursor(cursor);

  return or(
    lt(productTable.createdAt, decodedCursor.createdAt),
    and(
      eq(productTable.createdAt, decodedCursor.createdAt),
      lt(productTable.id, asProductId(decodedCursor.id)),
    ),
  );
};

const buildAdminProductFilters = (input: AdminProductListInput) => {
  const filters: SQL[] = [];

  if (input.brand) {
    filters.push(eq(productTable.brand, input.brand));
  }

  if (input.category) {
    filters.push(eq(productTable.category, input.category));
  }

  if (input.condition) {
    filters.push(eq(productTable.condition, input.condition));
  }

  if (input.publicationState === "draft") {
    filters.push(eq(productTable.draft, true));
  } else if (input.publicationState === "published") {
    filters.push(eq(productTable.draft, false));
  }

  if (input.inventoryState === "sold") {
    filters.push(or(eq(productTable.isSold, true), eq(productTable.reservationStatus, "sold")));
  } else if (input.inventoryState === "non-sold") {
    filters.push(and(eq(productTable.isSold, false), ne(productTable.reservationStatus, "sold")));
  }

  return filters;
};

export const listAdminProducts = async (
  bindings: CommerceBindings,
  input: AdminProductListInput,
): Promise<AdminProductPage> => {
  const db = createDb(bindings.DB);
  const baseFilters = buildAdminProductFilters(input);
  const cursorFilter = buildCursorFilter(input.cursor);
  const filters = [...baseFilters];

  if (cursorFilter) {
    filters.push(cursorFilter);
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const totalCountQuery = db.select({ value: count() }).from(productTable);
  const rowsQuery = db
    .select()
    .from(productTable)
    .orderBy(desc(productTable.createdAt), desc(productTable.id))
    .limit(input.limit + 1);

  const totalCountResult = await (baseFilters.length > 0
    ? totalCountQuery.where(and(...baseFilters))
    : totalCountQuery);
  const rows = await (whereClause ? rowsQuery.where(whereClause) : rowsQuery);

  const hasMore = rows.length > input.limit;
  const pageRows = hasMore ? rows.slice(0, input.limit) : rows;
  const lastRow = pageRows.at(-1);

  return {
    items: pageRows.map(toAdminProduct),
    nextCursor: hasMore && lastRow ? encodeCursor(lastRow) : null,
    totalCount: totalCountResult[0]?.value ?? 0,
  };
};

export const getAdminProduct = async (
  bindings: CommerceBindings,
  { productId }: { productId: string },
): Promise<AdminProduct> => {
  const db = createDb(bindings.DB);
  const [row] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, asProductId(productId)))
    .limit(1);

  if (!row) {
    throw new ORPCError("NOT_FOUND");
  }

  return toAdminProduct(row);
};

export const createAdminProduct = async (
  bindings: CommerceBindings,
  input: AdminProductWriteInput,
): Promise<AdminProduct> => {
  const db = createDb(bindings.DB);
  const productId = crypto.randomUUID();
  const { draft } = input;
  const publishedAt = resolvePublishedAt(draft, null);

  await db.insert(productTable).values({
    id: productId,
    title: input.title,
    brand: input.brand,
    category: input.category,
    condition: input.condition,
    size: input.size,
    price: input.price,
    currency: input.currency,
    description: input.description,
    images: input.images,
    isSold: false,
    reservationStatus: "available",
    reservedUntil: null,
    draft,
    costPrice: input.costPrice ?? null,
    internalNotes: input.internalNotes ?? null,
    internalTags: input.internalTags,
    publishedAt,
    updatedBy: null,
  });

  const [createdRow] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, asProductId(productId)))
    .limit(1);

  if (!createdRow) {
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }

  return toAdminProduct(createdRow);
};

export const updateAdminProduct = async (
  bindings: CommerceBindings,
  productId: string,
  changes: AdminProductPatchInput,
): Promise<AdminProduct> => {
  const db = createDb(bindings.DB);

  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(productTable)
      .where(eq(productTable.id, asProductId(productId)))
      .limit(1);

    if (!row) {
      throw new ORPCError("NOT_FOUND");
    }

    if (isSoldOutProduct(row)) {
      throw new ORPCError("CONFLICT");
    }

    const nextDraft = changes.draft ?? row.draft;
    const nextPublishedAt =
      changes.draft === undefined
        ? row.publishedAt
        : resolvePublishedAt(changes.draft, row.publishedAt);

    await tx
      .update(productTable)
      .set({
        title: changes.title ?? row.title,
        brand: changes.brand ?? row.brand,
        category: changes.category ?? row.category,
        condition: changes.condition ?? row.condition,
        size: changes.size ?? row.size,
        price: changes.price ?? row.price,
        currency: changes.currency ?? row.currency,
        description: changes.description ?? row.description,
        images: changes.images ?? row.images,
        costPrice: resolveNullablePatchValue(changes, "costPrice", row.costPrice),
        draft: nextDraft,
        internalNotes: resolveNullablePatchValue(changes, "internalNotes", row.internalNotes),
        internalTags: changes.internalTags ?? row.internalTags,
        publishedAt: nextPublishedAt,
      })
      .where(eq(productTable.id, row.id));

    const [updatedRow] = await tx
      .select()
      .from(productTable)
      .where(eq(productTable.id, row.id))
      .limit(1);

    if (!updatedRow) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    return updatedRow;
  });

  return toAdminProduct(result);
};
