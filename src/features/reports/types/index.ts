/**
 * Reports & Data Export Module Types
 */

import type { UserRole } from "@/lib/auth";

export type ReportType =
  | "inventory"
  | "low-stock"
  | "po"
  | "grn"
  | "stock-release"
  | "movement"
  | "supplier"
  | "product";

export interface ReportMeta {
  id: ReportType;
  title: string;
  description: string;
  category: "inventory" | "procurement" | "master-data";
  iconName: string;
  allowedRoles: UserRole[];
  lastGenerated?: string;
  supportedFormats: ("excel" | "csv" | "pdf")[];
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface CommonReportFilterParams extends DateRangeFilter {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  productId?: string;
  actionType?: string;
}

// 1. Inventory Report Item
export interface InventoryReportRow {
  id: string;
  productName: string;
  sku: string;
  categoryName: string;
  brandName: string;
  supplierName: string;
  currentQuantity: number;
  minimumStock: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  unitCost: number;
  totalValue: number;
}

// 2. Low Stock Report Item
export interface LowStockReportRow extends InventoryReportRow {
  shortageQuantity: number;
  reorderPoint: number;
}

// 3. Purchase Order Report Item
export interface PurchaseOrderReportRow {
  id: string;
  poNumber: string;
  supplierName: string;
  createdBy: string;
  createdDate: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PARTIALLY_RECEIVED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  itemCount: number;
}

// 4. GRN Report Item
export interface GrnReportRow {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  receivedBy: string;
  receivedDate: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED";
  totalItemsReceived: number;
}

// 5. Stock Release Report Item
export interface StockReleaseReportRow {
  id: string;
  releaseNumber: string;
  releaseDate: string;
  releasedBy: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED";
  totalItems: number;
  totalQuantity: number;
}

// 6. Inventory Movement Report Item
export interface InventoryMovementReportRow {
  id: string;
  timestamp: string;
  productName: string;
  sku: string;
  actionType: "INFLOW" | "OUTFLOW" | "ADJUSTMENT_ADD" | "ADJUSTMENT_SUBTRACT" | "TRANSFER";
  referenceNumber: string;
  quantityChange: number;
  balanceAfter: number;
  user: string;
}

// 7. Supplier Report Item
export interface SupplierReportRow {
  id: string;
  supplierName: string;
  contactPerson: string;
  poCount: number;
  grnCount: number;
  totalPurchaseValue: number;
  status: "ACTIVE" | "INACTIVE";
}

// 8. Product Report Item
export interface ProductReportRow {
  id: string;
  productName: string;
  sku: string;
  brandName: string;
  categoryName: string;
  currentStock: number;
  status: "ACTIVE" | "INACTIVE";
}

// Generic Paginated Report Data
export interface PaginatedReportResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
  summary?: Record<string, number | string>;
}

// Report KPI Summaries
export interface ReportKpiSummary {
  totalRecords: number;
  totalValue?: number;
  primaryMetricLabel: string;
  primaryMetricValue: number | string;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: number | string;
  tertiaryMetricLabel?: string;
  tertiaryMetricValue?: number | string;
}

// Chart dataset structures
export interface ReportChartData {
  categoryDistribution?: { name: string; value: number }[];
  movementTrends?: { date: string; inflows: number; outflows: number }[];
  supplierSpending?: { supplier: string; totalSpent: number }[];
  poStatusCounts?: { status: string; count: number }[];
}

// Export Payload & Response
export interface ExportReportParams {
  reportType: ReportType;
  format: "excel" | "csv" | "pdf";
  filters?: CommonReportFilterParams;
  selectedColumns?: string[];
  includeSummary?: boolean;
}

export interface ExportReportResult {
  blob: Blob;
  filename: string;
}
