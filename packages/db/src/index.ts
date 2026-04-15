import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";
export {
  asAccountId,
  asOrderId,
  asProductId,
  asReservationId,
  asSessionId,
  asUserId,
  asVerificationId,
  type AccountId,
  type OrderId,
  type ProductId,
  type ReservationId,
  type SessionId,
  type UserId,
  type VerificationId,
} from "./utils";

export function createDb(database: Parameters<typeof drizzle>[0]) {
  return drizzle(database, { schema });
}
