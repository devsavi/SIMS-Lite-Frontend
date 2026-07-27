import { z } from "zod";

export const grnItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  orderedQuantity: z.number().min(1, "Ordered quantity must be at least 1"),
  receivedQuantity: z
    .number({ invalid_type_error: "Received quantity must be a number" })
    .min(0, "Received quantity cannot be negative"),
  notes: z.string().nullable().optional(),
});

export const grnSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase Order is required"),
  notes: z.string().nullable().optional(),
  items: z.array(grnItemSchema).min(1, "At least one item is required"),
});

export type GRNFormValues = z.infer<typeof grnSchema>;
