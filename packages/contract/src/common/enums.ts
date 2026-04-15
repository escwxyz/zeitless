import { z } from "zod";

export const productConditionSchema = z.enum(["new", "pre-owned"]);

export const reservationStatusSchema = z.enum(["available", "reserved", "sold"]);

export const orderStatusSchema = z.enum(["reserved", "paid", "cancelled", "shipped", "completed"]);

export type ProductCondition = z.infer<typeof productConditionSchema>;
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
