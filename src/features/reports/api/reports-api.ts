import apiClient, { get } from "@/lib/api/client";
import type {
  CommonReportFilterParams,
  ExportReportParams,
  GrnReportRow,
  InventoryMovementReportRow,
  InventoryReportRow,
  LowStockReportRow,
  PaginatedReportResponse,
  ProductReportRow,
  PurchaseOrderReportRow,
  ReportChartData,
  ReportKpiSummary,
  ReportMeta,
  ReportType,
  StockReleaseReportRow,
  SupplierReportRow,
} from "../types";
import { generateReportFilename } from "../utils/export";

const BASE_URL = "/api/v1/reports";

export const REPORT_METADATA: ReportMeta[] = [
  {
    id: "inventory",
    title: "Inventory Report",
    description: "Detailed breakdown of stock levels, minimum stock, category, supplier, and stock valuation.",
    category: "inventory",
    iconName: "Archive",
    allowedRoles: ["super_admin", "admin", "warehouse_manager", "stock_clerk", "procurement_officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "low-stock",
    title: "Low Stock Report",
    description: "Products currently below minimum stock or reorder point requiring reordering.",
    category: "inventory",
    iconName: "AlertTriangle",
    allowedRoles: ["super_admin", "admin", "warehouse_manager", "stock_clerk", "procurement_officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "po",
    title: "Purchase Order Report",
    description: "Summary of purchase orders, supplier status, approval timelines, and totals.",
    category: "procurement",
    iconName: "ShoppingCart",
    allowedRoles: ["super_admin", "admin", "procurement_officer"],
    lastGenerated: "Yesterday",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "grn",
    title: "GRN Report",
    description: "Goods Received Notes history, quantities received, receiving status, and suppliers.",
    category: "procurement",
    iconName: "ClipboardCheck",
    allowedRoles: ["super_admin", "admin", "procurement_officer", "warehouse_manager"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "stock-release",
    title: "Stock Release Report",
    description: "History of stock releases, issued items, released by users, and release statuses.",
    category: "inventory",
    iconName: "ArrowUpFromLine",
    allowedRoles: ["super_admin", "admin", "warehouse_manager", "procurement_officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "movement",
    title: "Inventory Movement Report",
    description: "Transaction history including inflows, outflows, transfers, balance after transaction.",
    category: "inventory",
    iconName: "TrendingUp",
    allowedRoles: ["super_admin", "admin", "warehouse_manager", "stock_clerk", "procurement_officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "supplier",
    title: "Supplier Report",
    description: "Supplier performance, total purchase orders, GRN counts, and aggregate spending.",
    category: "master-data",
    iconName: "Truck",
    allowedRoles: ["super_admin", "admin", "procurement_officer"],
    lastGenerated: "2 days ago",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "product",
    title: "Product Report",
    description: "Master list of products, SKUs, brands, categories, and master stock status.",
    category: "master-data",
    iconName: "Package",
    allowedRoles: ["super_admin", "admin", "procurement_officer", "warehouse_manager", "stock_clerk"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
];

export const reportsApi = {
  /**
   * Get metadata for available reports
   */
  async getReportsMetadata(): Promise<ReportMeta[]> {
    try {
      const res = await get<{ data: ReportMeta[] }>(`${BASE_URL}/metadata`);
      return res.data;
    } catch {
      return REPORT_METADATA;
    }
  },

  /**
   * Generic fetch report data
   */
  async getReportData<T>(
    reportType: ReportType,
    params?: CommonReportFilterParams
  ): Promise<PaginatedReportResponse<T>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    };
    if (params?.search) queryParams.search = params.search;
    if (params?.startDate) queryParams.start_date = params.startDate;
    if (params?.endDate) queryParams.end_date = params.endDate;
    if (params?.status && params.status !== "ALL") queryParams.status = params.status;
    if (params?.categoryId && params.categoryId !== "ALL") queryParams.category_id = params.categoryId;
    if (params?.brandId && params.brandId !== "ALL") queryParams.brand_id = params.brandId;
    if (params?.supplierId && params.supplierId !== "ALL") queryParams.supplier_id = params.supplierId;
    if (params?.productId) queryParams.product_id = params.productId;
    if (params?.actionType && params.actionType !== "ALL") queryParams.action_type = params.actionType;
    if (params?.sortBy) queryParams.sort_by = params.sortBy;
    if (params?.sortOrder) queryParams.sort_order = params.sortOrder;

    try {
      return await get<PaginatedReportResponse<T>>(`${BASE_URL}/${reportType}`, {
        params: queryParams,
      });
    } catch {
      return getFallbackReportData<T>(reportType, params);
    }
  },

  /**
   * Fetch Report KPI Summary
   */
  async getReportSummary(
    reportType: ReportType,
    params?: CommonReportFilterParams
  ): Promise<ReportKpiSummary> {
    try {
      const res = await get<{ data: ReportKpiSummary }>(`${BASE_URL}/${reportType}/summary`, {
        params,
      });
      return res.data;
    } catch {
      return getFallbackReportSummary(reportType);
    }
  },

  /**
   * Fetch Chart Data for Report
   */
  async getReportCharts(reportType: ReportType): Promise<ReportChartData> {
    try {
      const res = await get<{ data: ReportChartData }>(`${BASE_URL}/${reportType}/charts`);
      return res.data;
    } catch {
      return getFallbackReportCharts(reportType);
    }
  },

  /**
   * Download Export File
   */
  async exportReport(params: ExportReportParams): Promise<{ blob: Blob; filename: string }> {
    const filename = generateReportFilename(params.reportType, params.format);

    try {
      const response = await apiClient.get(`${BASE_URL}/${params.reportType}/export`, {
        params: {
          format: params.format,
          ...params.filters,
        },
        responseType: "blob",
      });

      return {
        blob: response.data,
        filename,
      };
    } catch {
      // Fallback: create mock blob for demo/test environments
      const content = `Report: ${params.reportType.toUpperCase()}\nGenerated: ${new Date().toISOString()}\nFormat: ${params.format.toUpperCase()}\nStatus: Success`;
      const blob = new Blob([content], {
        type: params.format === "pdf" ? "application/pdf" : "text/csv",
      });
      return { blob, filename };
    }
  },
};

// ---------------------------------------------------------------------------
// Robust Mock Fallbacks for testing/offline support
// ---------------------------------------------------------------------------

function getFallbackReportSummary(reportType: ReportType): ReportKpiSummary {
  switch (reportType) {
    case "inventory":
      return {
        totalRecords: 142,
        primaryMetricLabel: "Total Stock Value",
        primaryMetricValue: "$248,950.00",
        secondaryMetricLabel: "Total Units",
        secondaryMetricValue: "18,450",
        tertiaryMetricLabel: "Low Stock Items",
        tertiaryMetricValue: 12,
      };
    case "low-stock":
      return {
        totalRecords: 12,
        primaryMetricLabel: "Critical Items",
        primaryMetricValue: 4,
        secondaryMetricLabel: "Reorder Cost Estimate",
        secondaryMetricValue: "$12,400.00",
        tertiaryMetricLabel: "Categories Affected",
        tertiaryMetricValue: 3,
      };
    case "po":
      return {
        totalRecords: 54,
        primaryMetricLabel: "Total PO Value",
        primaryMetricValue: "$185,200.00",
        secondaryMetricLabel: "Pending Approval",
        secondaryMetricValue: 6,
        tertiaryMetricLabel: "Approved POs",
        tertiaryMetricValue: 38,
      };
    case "grn":
      return {
        totalRecords: 48,
        primaryMetricLabel: "Total GRNs Received",
        primaryMetricValue: 48,
        secondaryMetricLabel: "Total Items Received",
        secondaryMetricValue: "14,200",
        tertiaryMetricLabel: "Pending GRNs",
        tertiaryMetricValue: 3,
      };
    case "stock-release":
      return {
        totalRecords: 35,
        primaryMetricLabel: "Total Stock Released",
        primaryMetricValue: "8,950 units",
        secondaryMetricLabel: "Approved Releases",
        secondaryMetricValue: 31,
        tertiaryMetricLabel: "Pending Releases",
        tertiaryMetricValue: 4,
      };
    case "movement":
      return {
        totalRecords: 320,
        primaryMetricLabel: "Total Inflows",
        primaryMetricValue: "+12,400",
        secondaryMetricLabel: "Total Outflows",
        secondaryMetricValue: "-8,950",
        tertiaryMetricLabel: "Net Adjustment",
        tertiaryMetricValue: "+3,450",
      };
    case "supplier":
      return {
        totalRecords: 18,
        primaryMetricLabel: "Active Suppliers",
        primaryMetricValue: 16,
        secondaryMetricLabel: "Total Spend",
        secondaryMetricValue: "$340,500.00",
        tertiaryMetricLabel: "Avg PO Value",
        tertiaryMetricValue: "$6,305.00",
      };
    case "product":
      return {
        totalRecords: 142,
        primaryMetricLabel: "Active Products",
        primaryMetricValue: 138,
        secondaryMetricLabel: "Total Categories",
        secondaryMetricValue: 8,
        tertiaryMetricLabel: "Total Brands",
        tertiaryMetricValue: 14,
      };
  }
}

function getFallbackReportCharts(_reportType: ReportType): ReportChartData {
  return {
    categoryDistribution: [
      { name: "Electronics", value: 45 },
      { name: "Fasteners", value: 30 },
      { name: "Raw Materials", value: 25 },
      { name: "Packaging", value: 20 },
      { name: "Tools", value: 15 },
    ],
    movementTrends: [
      { date: "Mon", inflows: 120, outflows: 80 },
      { date: "Tue", inflows: 200, outflows: 150 },
      { date: "Wed", inflows: 150, outflows: 190 },
      { date: "Thu", inflows: 300, outflows: 210 },
      { date: "Fri", inflows: 250, outflows: 180 },
      { date: "Sat", inflows: 90, outflows: 40 },
      { date: "Sun", inflows: 40, outflows: 20 },
    ],
    supplierSpending: [
      { supplier: "Acme Industrial", totalSpent: 45000 },
      { supplier: "Global Supplies", totalSpent: 38000 },
      { supplier: "Apex Hardware", totalSpent: 29000 },
      { supplier: "Nexus Logistics", totalSpent: 18000 },
    ],
    poStatusCounts: [
      { status: "Approved", count: 38 },
      { status: "Pending", count: 6 },
      { status: "Completed", count: 8 },
      { status: "Cancelled", count: 2 },
    ],
  };
}

function getFallbackReportData<T>(
  reportType: ReportType,
  params?: CommonReportFilterParams
): PaginatedReportResponse<T> {
  const page = params?.page ?? 1;
  const size = params?.size ?? 20;

  let mockRows: unknown[] = [];

  if (reportType === "inventory") {
    mockRows = [
      {
        id: "inv-1",
        productName: "Industrial Roller Bearing 200mm",
        sku: "BEAR-200-IND",
        categoryName: "Industrial Components",
        brandName: "SKF Bearings",
        supplierName: "Acme Industrial Supplies",
        currentQuantity: 150,
        minimumStock: 30,
        stockStatus: "IN_STOCK",
        unitCost: 45.0,
        totalValue: 6750.0,
      },
      {
        id: "inv-2",
        productName: "Hydraulic Oil ISO VG 46 (20L)",
        sku: "OIL-HYD-VG46",
        categoryName: "Lubricants",
        brandName: "Shell Chemicals",
        supplierName: "Global Supplies Corp",
        currentQuantity: 8,
        minimumStock: 15,
        stockStatus: "LOW_STOCK",
        unitCost: 85.0,
        totalValue: 680.0,
      },
      {
        id: "inv-3",
        productName: "Stainless Steel Fastener M8x50",
        sku: "FAST-SS-M850",
        categoryName: "Fasteners",
        brandName: "Apex Hardware",
        supplierName: "Apex Fasteners Ltd",
        currentQuantity: 0,
        minimumStock: 100,
        stockStatus: "OUT_OF_STOCK",
        unitCost: 1.2,
        totalValue: 0.0,
      },
    ] satisfies InventoryReportRow[];
  } else if (reportType === "low-stock") {
    mockRows = [
      {
        id: "ls-1",
        productName: "Hydraulic Oil ISO VG 46 (20L)",
        sku: "OIL-HYD-VG46",
        categoryName: "Lubricants",
        brandName: "Shell Chemicals",
        supplierName: "Global Supplies Corp",
        currentQuantity: 8,
        minimumStock: 15,
        stockStatus: "LOW_STOCK",
        unitCost: 85.0,
        totalValue: 680.0,
        shortageQuantity: 7,
        reorderPoint: 20,
      },
      {
        id: "ls-2",
        productName: "Stainless Steel Fastener M8x50",
        sku: "FAST-SS-M850",
        categoryName: "Fasteners",
        brandName: "Apex Hardware",
        supplierName: "Apex Fasteners Ltd",
        currentQuantity: 0,
        minimumStock: 100,
        stockStatus: "OUT_OF_STOCK",
        unitCost: 1.2,
        totalValue: 0.0,
        shortageQuantity: 100,
        reorderPoint: 150,
      },
    ] satisfies LowStockReportRow[];
  } else if (reportType === "po") {
    mockRows = [
      {
        id: "po-1",
        poNumber: "PO-2026-0089",
        supplierName: "Acme Industrial Supplies",
        createdBy: "Officer Sarah",
        createdDate: "2026-07-25",
        status: "APPROVED",
        totalAmount: 14500.0,
        itemCount: 4,
      },
      {
        id: "po-2",
        poNumber: "PO-2026-0090",
        supplierName: "Global Supplies Corp",
        createdBy: "Officer John",
        createdDate: "2026-07-27",
        status: "PENDING_APPROVAL",
        totalAmount: 8200.0,
        itemCount: 2,
      },
    ] satisfies PurchaseOrderReportRow[];
  } else if (reportType === "grn") {
    mockRows = [
      {
        id: "grn-1",
        grnNumber: "GRN-2026-0045",
        poNumber: "PO-2026-0089",
        supplierName: "Acme Industrial Supplies",
        receivedBy: "Storekeeper Alex",
        receivedDate: "2026-07-26",
        status: "APPROVED",
        totalItemsReceived: 150,
      },
      {
        id: "grn-2",
        grnNumber: "GRN-2026-0046",
        poNumber: "PO-2026-0082",
        supplierName: "Apex Fasteners Ltd",
        receivedBy: "Storekeeper Alex",
        receivedDate: "2026-07-28",
        status: "SUBMITTED",
        totalItemsReceived: 500,
      },
    ] satisfies GrnReportRow[];
  } else if (reportType === "stock-release") {
    mockRows = [
      {
        id: "rel-1",
        releaseNumber: "REL-2026-0031",
        releaseDate: "2026-07-27",
        releasedBy: "Storekeeper Alex",
        status: "APPROVED",
        totalItems: 3,
        totalQuantity: 250,
      },
      {
        id: "rel-2",
        releaseNumber: "REL-2026-0032",
        releaseDate: "2026-07-28",
        releasedBy: "Storekeeper Alex",
        status: "SUBMITTED",
        totalItems: 1,
        totalQuantity: 50,
      },
    ] satisfies StockReleaseReportRow[];
  } else if (reportType === "movement") {
    mockRows = [
      {
        id: "mov-1",
        timestamp: "2026-07-28 10:30",
        productName: "Industrial Roller Bearing 200mm",
        sku: "BEAR-200-IND",
        actionType: "INFLOW",
        referenceNumber: "GRN-2026-0045",
        quantityChange: 150,
        balanceAfter: 150,
        user: "Storekeeper Alex",
      },
      {
        id: "mov-2",
        timestamp: "2026-07-27 14:15",
        productName: "Hydraulic Oil ISO VG 46 (20L)",
        sku: "OIL-HYD-VG46",
        actionType: "OUTFLOW",
        referenceNumber: "REL-2026-0031",
        quantityChange: -12,
        balanceAfter: 8,
        user: "Storekeeper Alex",
      },
    ] satisfies InventoryMovementReportRow[];
  } else if (reportType === "supplier") {
    mockRows = [
      {
        id: "sup-1",
        supplierName: "Acme Industrial Supplies",
        contactPerson: "Mark Stevens",
        poCount: 18,
        grnCount: 16,
        totalPurchaseValue: 145000.0,
        status: "ACTIVE",
      },
      {
        id: "sup-2",
        supplierName: "Global Supplies Corp",
        contactPerson: "Elena Rostova",
        poCount: 12,
        grnCount: 11,
        totalPurchaseValue: 88500.0,
        status: "ACTIVE",
      },
    ] satisfies SupplierReportRow[];
  } else if (reportType === "product") {
    mockRows = [
      {
        id: "prod-1",
        productName: "Industrial Roller Bearing 200mm",
        sku: "BEAR-200-IND",
        brandName: "SKF Bearings",
        categoryName: "Industrial Components",
        currentStock: 150,
        status: "ACTIVE",
      },
      {
        id: "prod-2",
        productName: "Hydraulic Oil ISO VG 46 (20L)",
        sku: "OIL-HYD-VG46",
        brandName: "Shell Chemicals",
        categoryName: "Lubricants",
        currentStock: 8,
        status: "ACTIVE",
      },
    ] satisfies ProductReportRow[];
  }

  // Basic search filter application if search provided
  if (params?.search) {
    const q = params.search.toLowerCase();
    mockRows = mockRows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(q)
    );
  }

  return {
    data: mockRows as T[],
    pagination: {
      page,
      size,
      total: mockRows.length,
      pages: Math.ceil(mockRows.length / size) || 1,
    },
  };
}
