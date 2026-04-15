import { z } from "zod";

export const checkoutFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("Please enter a valid email address."),
  line1: z.string().trim().min(1, "Street address is required."),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required."),
  region: z.string().trim().optional(),
  postalCode: z.string().trim().min(1, "Postal code is required."),
  country: z.string().trim().min(1, "Please select a country."),
  phone: z.string().trim().optional(),
});

export const checkoutFormDefaults = {
  fullName: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "United Kingdom",
  phone: "",
} as const;

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
