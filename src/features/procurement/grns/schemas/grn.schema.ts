import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared item schemas
// ---------------------------------------------------------------------------

export const grnItemSchemaPOBased = z.object({
  po_item_id: z.string().min(1, "PO item reference is required"),
  product_id: z.string().min(1, "Product is required"),
  quantity_received: z
    .number({ invalid_type_error: "Received quantity must be a number" })
    .min(0, "Received quantity cannot be negative"),
  unit_cost: z
    .number({ invalid_type_error: "Unit cost must be a number" })
    .min(0, "Unit cost cannot be negative"),
  notes: z.string().nullable().optional(),
});

export const grnItemSchemaDirect = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity_received: z
    .number({ invalid_type_error: "Received quantity must be a number" })
    .min(1, "Received quantity must be greater than 0"),
  unit_cost: z
    .number({ invalid_type_error: "Unit cost must be a number" })
    .min(0, "Unit cost cannot be negative"),
  notes: z.string().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Top-level schemas — discriminated by mode
// ---------------------------------------------------------------------------

export const grnSchemaPOBased = z.object({
  mode: z.literal("po_based"),
  purchase_order_id: z.string().min(1, "Purchase Order is required"),
  received_date: z.string().min(1, "Received date is required"),
  delivery_note_number: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(grnItemSchemaPOBased).min(1, "At least one item is required"),
});

export const grnSchemaDirect = z.object({
  mode: z.literal("direct"),
  supplier_id: z.string().min(1, "Supplier is required"),
  received_date: z.string().min(1, "Received date is required"),
  delivery_note_number: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(grnItemSchemaDirect).min(1, "At least one item is required"),
});

export const grnSchema = z.discriminatedUnion("mode", [
  grnSchemaPOBased,
  grnSchemaDirect,
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GRNItemPOBasedFormValues = z.infer<typeof grnItemSchemaPOBased>;
export type GRNItemDirectFormValues = z.infer<typeof grnItemSchemaDirect>;
export type GRNFormValues = z.infer<typeof grnSchema>;
export type GRNFormValuesPOBased = z.infer<typeof grnSchemaPOBased>;
export type GRNFormValuesDirect = z.infer<typeof grnSchemaDirect>;
