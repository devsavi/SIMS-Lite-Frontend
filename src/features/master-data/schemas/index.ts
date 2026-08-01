/**
 * Master Data — Zod validation schemas
 */

import { z } from "zod";
import { emailSchema, phoneSchema } from "@/schemas";

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  description: z.string().max(500, "Description must not exceed 500 characters").optional().or(z.literal("")),
  parent_id: z.string().uuid("Invalid category").nullable().optional(),
  is_active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  description: z.string().max(500, "Description must not exceed 500 characters").optional().or(z.literal("")),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
  is_active: z.boolean().default(true),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

// ---------------------------------------------------------------------------
// Unit of Measure
// ---------------------------------------------------------------------------

export const uomSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(20, "Symbol must not exceed 20 characters")
    .trim(),
  description: z.string().max(500, "Description must not exceed 500 characters").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type UomFormValues = z.infer<typeof uomSchema>;

// ---------------------------------------------------------------------------
// Supplier
// ---------------------------------------------------------------------------

export const supplierSchema = z.object({
  company_name: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must not exceed 200 characters")
    .trim(),
  contact_person: z
    .string()
    .max(100, "Contact person must not exceed 100 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  email: emailSchema.optional().or(z.literal("")).nullable(),
  phone: phoneSchema.optional().nullable(),
  address: z
    .string()
    .max(500, "Address must not exceed 500 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  city: z
    .string()
    .max(100, "City must not exceed 100 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  country: z
    .string()
    .max(100, "Country must not exceed 100 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  is_active: z.boolean().default(true),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must not exceed 200 characters")
    .trim(),
  short_description: z
    .string()
    .max(500, "Short description must not exceed 500 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  category_id: z.string().uuid("Invalid category").nullable().optional(),
  brand_id: z.string().uuid("Invalid brand").nullable().optional(),
  uom_id: z.string().uuid("Invalid unit of measure").nullable().optional(),
  supplier_id: z.string().uuid("Invalid supplier").nullable().optional(),
  cost_price: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cost price cannot be negative")
    .default(0),
  selling_price: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Selling price cannot be negative")
    .default(0),
  reorder_level: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Reorder level cannot be negative")
    .default(0),
  reorder_quantity: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Reorder quantity cannot be negative")
    .default(0),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;
