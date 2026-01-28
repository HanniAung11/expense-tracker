import { z } from "zod";
import { CATEGORIES, PAYMENT_METHODS } from "@/types";

const categoryNames = CATEGORIES.map((c) => c.name) as [string, ...string[]];
const paymentMethods = [...PAYMENT_METHODS] as [string, ...string[]];

export const expenseSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount cannot exceed 1,000,000")
    .refine((val) => {
      const decimals = val.toString().split(".")[1];
      return !decimals || decimals.length <= 2;
    }, "Amount can have at most 2 decimal places"),
  category: z.enum(categoryNames as [string, ...string[]]),
  // Accept both Date objects and ISO date strings, then coerce to Date
  date: z
    .preprocess(
      (val) => {
        if (val instanceof Date) return val;
        if (typeof val === "string" || typeof val === "number") {
          const parsed = new Date(val);
          return isNaN(parsed.getTime()) ? undefined : parsed;
        }
        return undefined;
      },
      z
        .date({ required_error: "Date is required" })
        .max(new Date(), { message: "Date cannot be in the future" })
    ),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),
  paymentMethod: z.enum(paymentMethods as [string, ...string[]]),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

