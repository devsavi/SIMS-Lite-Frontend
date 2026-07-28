import { z } from "zod";

export const stockReleaseItemSchema = z
  .object({
    product_id: z.string().min(1, "Product is required"),
    quantity: z.coerce
      .number({ invalid_type_error: "Quantity must be a valid number" })
      .gt(0, "Quantity must be greater than 0"),
    available_quantity: z.coerce.number().optional(),
    unit_of_measure: z.string().min(1, "Unit of measure is required"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        typeof data.available_quantity === "number" &&
        data.available_quantity >= 0
      ) {
        return data.quantity <= data.available_quantity;
      }
      return true;
    },
    {
      message: "Release quantity cannot exceed available stock",
      path: ["quantity"],
    }
  );

export const stockReleaseFormSchema = z
  .object({
    release_date: z.string().min(1, "Release date is required"),
    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),
    items: z
      .array(stockReleaseItemSchema)
      .min(1, "At least one item must be added to the release"),
  })
  .refine(
    (data) => {
      const selectedProductIds = data.items
        .map((item) => item.product_id)
        .filter(Boolean);
      const uniqueProductIds = new Set(selectedProductIds);
      return selectedProductIds.length === uniqueProductIds.size;
    },
    {
      message: "Duplicate products are not allowed in the same release",
      path: ["items"],
    }
  );

export type StockReleaseFormValues = z.infer<typeof stockReleaseFormSchema>;
export type StockReleaseItemFormValues = z.infer<typeof stockReleaseItemSchema>;
