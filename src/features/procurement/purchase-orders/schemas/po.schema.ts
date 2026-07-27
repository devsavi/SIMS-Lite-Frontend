import { z } from "zod";

export const poItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(1, "Quantity must be at least 1"),
  unitCost: z.number({ invalid_type_error: "Unit cost must be a number" }).min(0, "Unit cost cannot be negative"),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedDeliveryDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(poItemSchema).min(1, "At least one item is required"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
