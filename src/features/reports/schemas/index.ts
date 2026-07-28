import { z } from "zod";

export const reportFilterSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  productId: z.string().optional(),
  actionType: z.string().optional(),
  page: z.number().int().min(1).default(1),
  size: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const exportReportSchema = z.object({
  reportType: z.enum([
    "inventory",
    "low-stock",
    "po",
    "grn",
    "stock-release",
    "movement",
    "supplier",
    "product",
  ]),
  format: z.enum(["excel", "csv", "pdf"]),
  includeSummary: z.boolean().default(true),
  selectedColumns: z.array(z.string()).optional(),
});

export type ReportFilterFormData = z.infer<typeof reportFilterSchema>;
export type ExportReportFormData = z.infer<typeof exportReportSchema>;
