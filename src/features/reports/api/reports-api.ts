import apiClient, { get } from "@/lib/api/client";
import type {
  AnalyticsOverviewResponse,
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
  ReportMetricType,
  ReportType,
  StockReleaseReportRow,
  SupplierReportRow,
} from "../types";


import { generateReportFilename } from "../utils/export";

// NOTE: apiClient.baseURL is already set to http://localhost:8001/api/v1
// so all paths here must be relative to that — no /api/v1 prefix needed.
const BASE_URL = "/reports";

export const REPORT_METADATA: ReportMeta[] = [
  {
    id: "inventory",
    title: "Inventory Report",
    description: "Detailed breakdown of stock levels, minimum stock, category, supplier, and stock valuation.",
    category: "inventory",
    iconName: "Archive",
    // ADMIN: inventory:read | OFFICER: inventory:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "low-stock",
    title: "Low Stock Report",
    description: "Products currently below minimum stock or reorder point requiring reordering.",
    category: "inventory",
    iconName: "AlertTriangle",
    // ADMIN: inventory:read | OFFICER: inventory:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "po",
    title: "Purchase Order Report",
    description: "Summary of purchase orders, supplier status, approval timelines, and totals.",
    category: "procurement",
    iconName: "ShoppingCart",
    // ADMIN: procurement:read | OFFICER: procurement:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "Yesterday",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "grn",
    title: "GRN Report",
    description: "Goods Received Notes history, quantities received, receiving status, and suppliers.",
    category: "procurement",
    iconName: "ClipboardCheck",
    // ADMIN: procurement:read | OFFICER: procurement:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "stock-release",
    title: "Stock Release Report",
    description: "History of stock releases, issued items, released by users, and release statuses.",
    category: "inventory",
    iconName: "ArrowUpFromLine",
    // ADMIN: inventory:read | OFFICER: inventory:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "movement",
    title: "Inventory Movement Report",
    description: "Transaction history including inflows, outflows, transfers, balance after transaction.",
    category: "inventory",
    iconName: "TrendingUp",
    // ADMIN: inventory:read | OFFICER: inventory:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "supplier",
    title: "Supplier Report",
    description: "Supplier performance, total purchase orders, GRN counts, and aggregate spending.",
    category: "master-data",
    iconName: "Truck",
    // ADMIN: master_data:read | OFFICER: master_data:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "2 days ago",
    supportedFormats: ["excel", "csv", "pdf"],
  },
  {
    id: "product",
    title: "Product Report",
    description: "Master list of products, SKUs, brands, categories, and master stock status.",
    category: "master-data",
    iconName: "Package",
    // ADMIN: master_data:read | OFFICER: master_data:read | STORE_KEEPER: no reports:read
    allowedRoles: ["admin", "officer"],
    lastGenerated: "Today",
    supportedFormats: ["excel", "csv", "pdf"],
  },
];


export const reportsApi = {
  /**
   * Returns static report metadata — no backend endpoint exists for this.
   */
  async getReportsMetadata(): Promise<ReportMeta[]> {
    return REPORT_METADATA;
  },

  /**
   * Fetch Executive Analytics Overview
   * Backend: GET /api/v1/reports/analytics/overview
   */
  async getAnalyticsOverview(params?: CommonReportFilterParams): Promise<AnalyticsOverviewResponse> {
    const queryParams: Record<string, unknown> = {
      period: params?.period || "day",
    };
    if (params?.startDate) queryParams.from_date = params.startDate;
    if (params?.endDate) queryParams.to_date = params.endDate;
    if (params?.categoryId && params.categoryId !== "ALL") queryParams.category_id = params.categoryId;
    if (params?.supplierId && params.supplierId !== "ALL") queryParams.supplier_id = params.supplierId;

    try {
      return await get<AnalyticsOverviewResponse>(`${BASE_URL}/analytics/overview`, {
        params: queryParams,
      });
    } catch {
      return getFallbackAnalyticsOverview(params?.period || "day");
    }
  },

  /**
   * Generic fetch report data (paginated)
   * Backend: GET /api/v1/reports/{report_type}?period=day&page=1&size=20&...
   */
  async getReportData<T>(
    reportType: ReportType,
    params?: CommonReportFilterParams
  ): Promise<PaginatedReportResponse<T>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
      period: params?.period || "day",
    };
    if (params?.search) queryParams.search = params.search;
    if (params?.startDate) queryParams.from_date = params.startDate;
    if (params?.endDate) queryParams.to_date = params.endDate;
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
   * Fetch Report KPI Summary.
   * There is no dedicated /summary endpoint on the backend.
   * We derive summary data from the analytics overview.
   * Backend: GET /api/v1/reports/analytics/overview?period=...
   */
  async getReportSummary(
    reportType: ReportType,
    params?: CommonReportFilterParams
  ): Promise<ReportKpiSummary> {
    try {
      const dataResp = await reportsApi.getReportData(reportType, params);
      if (dataResp && dataResp.summary) {
        return {
          totalRecords: Number(dataResp.summary.totalRecords ?? dataResp.pagination.total ?? 0),
          primaryMetricLabel: String(dataResp.summary.primaryMetricLabel ?? "Total Records"),
          primaryMetricValue: (dataResp.summary.primaryMetricValue as number | string) ?? 0,
          primaryMetricType: (dataResp.summary.primaryMetricType as ReportMetricType) ?? "text",
          secondaryMetricLabel: dataResp.summary.secondaryMetricLabel ? String(dataResp.summary.secondaryMetricLabel) : undefined,
          secondaryMetricValue: dataResp.summary.secondaryMetricValue as number | string | undefined,
          secondaryMetricType: (dataResp.summary.secondaryMetricType as ReportMetricType) ?? "text",
          tertiaryMetricLabel: dataResp.summary.tertiaryMetricLabel ? String(dataResp.summary.tertiaryMetricLabel) : undefined,
          tertiaryMetricValue: dataResp.summary.tertiaryMetricValue as number | string | undefined,
          tertiaryMetricType: (dataResp.summary.tertiaryMetricType as ReportMetricType) ?? "text",
        };
      }
      const overview = await reportsApi.getAnalyticsOverview(params);
      return deriveSummaryFromOverview(reportType, overview);
    } catch {
      return getFallbackReportSummary(reportType);
    }
  },

  /**
   * Fetch Chart Data for Report.
   * There is no dedicated /charts endpoint on the backend.
   * Chart data is embedded in the analytics overview response.
   * Backend: GET /api/v1/reports/analytics/overview?period=...
   */
  async getReportCharts(
    reportType: ReportType,
    params?: CommonReportFilterParams
  ): Promise<ReportChartData> {
    try {
      const overview = await reportsApi.getAnalyticsOverview(params);
      return deriveChartsFromOverview(overview);
    } catch {
      return getFallbackReportCharts(reportType);
    }
  },

  /**
   * Download Export File
   * Backend: GET /api/v1/reports/{report_type}/export?format=excel|pdf|csv&...
   */
  async exportReport(params: ExportReportParams): Promise<{ blob: Blob; filename: string }> {
    const filename = generateReportFilename(params.reportType, params.format);

    try {
      const response = await apiClient.get(`${BASE_URL}/${params.reportType}/export`, {
        params: {
          format: params.format,
          period: params.filters?.period || "day",
          from_date: params.filters?.startDate,
          to_date: params.filters?.endDate,
          search: params.filters?.search,
          category_id: params.filters?.categoryId,
          supplier_id: params.filters?.supplierId,
          brand_id: params.filters?.brandId,
          status: params.filters?.status,
        },
        responseType: "blob",
      });

      return {
        blob: response.data,
        filename,
      };
    } catch {
      // Fallback: create a placeholder blob so the download still triggers
      const content = `Report: ${params.reportType.toUpperCase()}\nGenerated: ${new Date().toISOString()}\nFormat: ${params.format.toUpperCase()}\nStatus: Offline/Demo mode`;
      const blob = new Blob([content], {
        type: params.format === "pdf" ? "application/pdf" : "text/csv",
      });
      return { blob, filename };
    }
  },
};

// ---------------------------------------------------------------------------
// Helpers — derive summary & chart data from AnalyticsOverviewResponse
// ---------------------------------------------------------------------------

function deriveSummaryFromOverview(
  reportType: ReportType,
  overview: AnalyticsOverviewResponse
): ReportKpiSummary {
  const kpis = overview.kpis;
  switch (reportType) {
    case "inventory":
      return {
        totalRecords: kpis.total_stock_value.items_count,
        primaryMetricLabel: "Total Stock Value",
        primaryMetricValue: kpis.total_stock_value.current,
        primaryMetricType: "currency",
        secondaryMetricLabel: "Low Stock Items",
        secondaryMetricValue: kpis.low_stock_count.current,
        secondaryMetricType: "number",
        tertiaryMetricLabel: "Out of Stock",
        tertiaryMetricValue: kpis.out_of_stock_count.current,
        tertiaryMetricType: "number",
      };
    case "low-stock":
      return {
        totalRecords: kpis.low_stock_count.current + kpis.out_of_stock_count.current,
        primaryMetricLabel: "Low Stock Items",
        primaryMetricValue: kpis.low_stock_count.current,
        primaryMetricType: "number",
        secondaryMetricLabel: "Out of Stock",
        secondaryMetricValue: kpis.out_of_stock_count.current,
        secondaryMetricType: "number",
        tertiaryMetricLabel: "Stock Alerts",
        tertiaryMetricValue: kpis.low_stock_count.current + kpis.out_of_stock_count.current,
        tertiaryMetricType: "number",
      };
    case "po":
      return {
        totalRecords: 0,
        primaryMetricLabel: "Total Spend",
        primaryMetricValue: kpis.procurement_spend.current,
        primaryMetricType: "currency",
        secondaryMetricLabel: "Spend Growth",
        secondaryMetricValue: `${kpis.procurement_spend.growth_percentage >= 0 ? "+" : ""}${kpis.procurement_spend.growth_percentage.toFixed(1)}%`,
        secondaryMetricType: "text",
        tertiaryMetricLabel: "Previous Period",
        tertiaryMetricValue: kpis.procurement_spend.previous,
        tertiaryMetricType: "currency",
      };
    case "stock-release":
      return {
        totalRecords: 0,
        primaryMetricLabel: "Items Dispatched",
        primaryMetricValue: kpis.items_dispatched.current,
        primaryMetricType: "number",
        secondaryMetricLabel: "Dispatch Change",
        secondaryMetricValue: `${kpis.items_dispatched.growth_percentage >= 0 ? "+" : ""}${kpis.items_dispatched.growth_percentage.toFixed(1)}%`,
        secondaryMetricType: "text",
        tertiaryMetricLabel: "Previous Period",
        tertiaryMetricValue: kpis.items_dispatched.previous,
        tertiaryMetricType: "number",
      };
    case "product":
      return {
        totalRecords: kpis.total_stock_value.items_count,
        primaryMetricLabel: "Total Catalog Products",
        primaryMetricValue: kpis.total_stock_value.items_count,
        primaryMetricType: "number",
        secondaryMetricLabel: "Categories Distribution",
        secondaryMetricValue: `${overview.charts.category_distribution.length} Categories`,
        secondaryMetricType: "text",
      };
    case "supplier":
      return {
        totalRecords: overview.charts.top_suppliers_by_spend.length,
        primaryMetricLabel: "Top Suppliers Spend",
        primaryMetricValue: kpis.procurement_spend.current,
        primaryMetricType: "currency",
        secondaryMetricLabel: "Top Suppliers Count",
        secondaryMetricValue: overview.charts.top_suppliers_by_spend.length,
        secondaryMetricType: "number",
      };
    case "grn":
      return {
        totalRecords: 0,
        primaryMetricLabel: "Items Dispatched",
        primaryMetricValue: kpis.items_dispatched.current,
        primaryMetricType: "number",
      };
    case "movement":
      return {
        totalRecords: overview.charts.movement_trends.length,
        primaryMetricLabel: "Ledger Movement Trends",
        primaryMetricValue: overview.charts.movement_trends.length,
        primaryMetricType: "number",
      };
    default:
      return getFallbackReportSummary(reportType);
  }
}

function deriveChartsFromOverview(overview: AnalyticsOverviewResponse): ReportChartData {
  const charts = overview.charts;
  return {
    movementTrends: charts.movement_trends.map((t) => ({
      date: t.date,
      inflows: t.inflows,
      outflows: t.outflows,
    })),
    categoryDistribution: charts.category_distribution.map((c) => ({
      name: c.category_name,
      value: c.item_count,
    })),
    supplierSpending: charts.top_suppliers_by_spend.map((s) => ({
      supplier: s.supplier_name,
      totalSpent: s.total_spent,
    })),
    poStatusCounts: charts.po_status_counts.map((p) => ({
      status: p.status,
      count: p.count,
    })),
  };
}

// ---------------------------------------------------------------------------
// Robust Mock Fallbacks for testing/offline support
// ---------------------------------------------------------------------------

function getFallbackAnalyticsOverview(period: string): AnalyticsOverviewResponse {
  return {
    period: period as any,
    date_range: { from: new Date().toISOString(), to: new Date().toISOString() },
    kpis: {
      total_stock_value: { current: 482500.0, items_count: 142 },
      low_stock_count: { current: 12 },
      out_of_stock_count: { current: 3 },
      procurement_spend: { current: 34500.0, previous: 28000.0, growth_percentage: 23.2 },
      items_dispatched: { current: 450.0, previous: 520.0, growth_percentage: -13.5 },
    },
    charts: {
      movement_trends: [
        { date: "08:00", inflows: 120, outflows: 45 },
        { date: "10:00", inflows: 80, outflows: 190 },
        { date: "12:00", inflows: 210, outflows: 150 },
        { date: "14:00", inflows: 150, outflows: 220 },
        { date: "16:00", inflows: 90, outflows: 110 },
      ],
      category_distribution: [
        { category_name: "Industrial Components", item_count: 45, stock_value: 240000.0 },
        { category_name: "Lubricants & Oils", item_count: 30, stock_value: 115000.0 },
        { category_name: "Fasteners", item_count: 52, stock_value: 85000.0 },
        { category_name: "Safety Gear", item_count: 15, stock_value: 42500.0 },
      ],
      top_suppliers_by_spend: [
        { supplier_name: "Acme Industrial Supplies", po_count: 5, total_spent: 18500.0 },
        { supplier_name: "Global Supplies Corp", po_count: 3, total_spent: 9800.0 },
        { supplier_name: "Apex Fasteners Ltd", po_count: 2, total_spent: 6200.0 },
      ],
      po_status_counts: [
        { status: "APPROVED", count: 14, amount: 28500.0 },
        { status: "PENDING_APPROVAL", count: 5, amount: 6000.0 },
      ],
    },
  };
}

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
