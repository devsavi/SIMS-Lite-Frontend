import { z } from "zod";
import { STOCK_RELEASE_PURPOSES } from "../constants/stock-release-constants";

export const stockReleaseItemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity_requested: z.coerce
    .number({ invalid_type_error: "Quantity must be a valid number" })
    .int("Quantity must be a whole number")
    .gt(0, "Quantity must be greater than 0"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
});

export const stockReleaseFormSchema = z
  .object({
    purpose: z.enum(
      STOCK_RELEASE_PURPOSES as [string, ...string[]],
      { required_error: "Purpose is required" }
    ),
    release_date: z.string().min(1, "Release date is required"),
    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),
    reference_document: z
      .string()
      .max(255, "Reference document cannot exceed 255 characters")
      .optional()
      .or(z.literal("")),
    items: z
      .array(stockReleaseItemSchema)
      .min(1, "At least one item must be added to the release"),
  })
  .refine(
    (data) => {
      const ids = data.items.map((i) => i.product_id).filter(Boolean);
      return ids.length === new Set(ids).size;
    },
    {
      message: "Duplicate products are not allowed in the same release",
      path: ["items"],
    }
  );

export type StockReleaseFormValues = z.infer<typeof stockReleaseFormSchema>;
export type StockReleaseItemFormValues = z.infer<typeof stockReleaseItemSchema>;
