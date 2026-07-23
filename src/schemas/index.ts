/**
 * Shared Zod schemas used across multiple features.
 * Feature-specific schemas live in src/features/<feature>/schemas.ts
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Reusable field schemas
// ---------------------------------------------------------------------------

export const idSchema = z.string().uuid("Invalid ID format");

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters");

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-().]{7,20}$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

export const urlSchema = z.string().url("Invalid URL").optional().or(z.literal(""));

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
