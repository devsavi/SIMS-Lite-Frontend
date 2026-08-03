import { z } from "zod";

export const poItemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity_ordered: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .min(1, "Quantity must be at least 1"),
  unit_price: z
    .number({ invalid_type_error: "Unit price must be a number" })
    .min(0, "Unit price cannot be negative"),
  discount_percent: z
    .number({ invalid_type_error: "Discount must be a number" })
    .min(0)
    .max(100)
    .optional()
    .default(0),
  tax_percent: z
    .number({ invalid_type_error: "Tax must be a number" })
    .min(0)
    .max(100)
    .optional()
    .default(0),
  notes: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  order_date: z.string().min(1, "Order date is required"),
  expected_delivery_date: z.string().min(1, "Expected delivery date is required"),
  notes: z.string().optional(),
  terms_conditions: z.string().optional(),
  shipping_address: z.string().optional(),
  items: z.array(poItemSchema).min(1, "At least one item is required"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
export type POItemFormValues = z.infer<typeof poItemSchema>;
