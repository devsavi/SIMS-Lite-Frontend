import { z } from "zod";

export const stockAdjustmentTypeEnum = z.enum([
  "increase",
  "decrease",
  "damage",
  "loss",
  "found",
  "cycle_count",
  "write_off",
]);

export const stockAdjustmentItemSchema = z.object({
  product_id: z.string().uuid("Please select a valid product"),
  quantity_adjusted: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .gt(0, "Quantity adjusted must be greater than 0"),
  unit_cost: z.number().min(0, "Unit cost must be non-negative").optional().default(0),
  notes: z.string().nullable().optional(),
});

export const stockAdjustmentSchema = z.object({
  adjustment_type: stockAdjustmentTypeEnum,
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason must not exceed 500 characters"),
  notes: z.string().nullable().optional(),
  items: z
    .array(stockAdjustmentItemSchema)
    .min(1, "At least one product item is required")
    .refine(
      (items) => {
        const productIds = items.map((i) => i.product_id);
        return new Set(productIds).size === productIds.length;
      },
      { message: "Duplicate products are not allowed in stock adjustment" }
    ),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
