import { text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

type Brand<T, Name extends string> = T & { readonly __tableName: Name };

export type AccountId = Brand<string, "accounts">;
export type OrderId = Brand<string, "orders">;
export type ProductId = Brand<string, "products">;
export type ReservationId = Brand<string, "reservations">;
export type UserId = Brand<string, "users">;
export type SessionId = Brand<string, "sessions">;
export type VerificationId = Brand<string, "verifications">;

export const createId = () => nanoid();

export const asAccountId = (value: string) => value as AccountId;
export const asOrderId = (value: string) => value as OrderId;
export const asProductId = (value: string) => value as ProductId;
export const asReservationId = (value: string) => value as ReservationId;
export const asUserId = (value: string) => value as UserId;
export const asSessionId = (value: string) => value as SessionId;
export const asVerificationId = (value: string) => value as VerificationId;

export const idColumn = <TId extends string>(name = "id") =>
  text(name)
    .$type<TId>()
    .$defaultFn(() => nanoid() as TId)
    .primaryKey();
