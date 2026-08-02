import { get, post, put, patch, del } from "@/lib/api/client";
import type {
  InventoryFilterParams,
  InventoryItem,
  InventorySummary,
  InventoryValuationSummary,
  InventoryLedgerEntry,
  LedgerFilterParams,
  StockAdjustment,
  StockAdjustmentSummary,
  StockAdjustmentCreatePayload,
  StockAdjustmentUpdatePayload,
  StockAdjustmentFilterParams,
} from "../types";

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

/** Wraps single-item API responses: { status, data } */
export interface SuccessResponse<T> {
  status?: string;
  data: T;
  message?: string;
}

/** Wraps paginated API responses: { status, data: [...], pagination } */
export interface PaginatedApiResponse<T> {
  status?: string;
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

const INVENTORY_BASE = "/inventory";
const LEDGER_BASE = "/inventory-ledger";
const ADJUSTMENT_BASE = "/stock-adjustments";

export const inventoryApi = {
  /**
   * GET /inventory — paginated list with filters.
   * Supports: search (name, sku, barcode), category_id, supplier_id,
   *           low_stock_only, out_of_stock_only, page, size (max 200).
   */
  async getInventoryList(
    params?: InventoryFilterParams
  ): Promise<PaginatedResponse<InventoryItem>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: Math.min(params?.size ?? 20, 200),
    };

    if (params?.search) queryParams.search = params.search;
    if (params?.category_id && params.category_id !== "ALL")
      queryParams.category_id = params.category_id;
    if (params?.supplier_id && params.supplier_id !== "ALL")
      queryParams.supplier_id = params.supplier_id;
    // Map stock_status UI value to explicit boolean API params
    if (params?.stock_status === "low_stock" || params?.low_stock_only === true)
      queryParams.low_stock_only = true;
    if (params?.stock_status === "out_of_stock" || params?.out_of_stock_only === true)
      queryParams.out_of_stock_only = true;

    const res = await get<PaginatedApiResponse<InventoryItem>>(INVENTORY_BASE, {
      params: queryParams,
    });
    // Normalise: API returns { status, data: [...], pagination }
    return { data: res.data, pagination: res.pagination };
  },

  /**
   * GET /inventory/summary — aggregate KPI totals.
   */
  async getInventorySummary(): Promise<InventorySummary> {
    const res = await get<SuccessResponse<InventorySummary>>(`${INVENTORY_BASE}/summary`);
    return res.data;
  },

  /**
   * Fetch inventory valuation summary.
   */
  async getInventoryValuation(): Promise<InventoryValuationSummary> {
    const res = await get<SuccessResponse<InventoryValuationSummary>>(`${INVENTORY_BASE}/value`);
    return res.data;
  },

  /**
   * GET /inventory/{product_id} — current stock for a specific product.
   * Response: { status, data: { ... } } — single object wrapper.
   */
  async getInventoryByProductId(productId: string): Promise<InventoryItem> {
    const res = await get<SuccessResponse<InventoryItem>>(`${INVENTORY_BASE}/${productId}`);
    return res.data;
  },

  /**
   * GET /inventory-ledger — paginated ledger entries with filters.
   * Supports: product_id, entry_type, reference_type, period (day/week/month/custom),
   *           from_date, to_date (when period=custom), page, size (max 200).
   */
  async getLedgerEntries(
    params?: LedgerFilterParams
  ): Promise<PaginatedResponse<InventoryLedgerEntry>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: Math.min(params?.size ?? 20, 200),
    };

    if (params?.product_id) queryParams.product_id = params.product_id;
    if (params?.entry_type && params.entry_type !== "ALL")
      queryParams.entry_type = params.entry_type;
    if (params?.reference_type && params.reference_type !== "ALL")
      queryParams.reference_type = params.reference_type;

    // Period filter — only send from_date/to_date when period is custom
    if (params?.period && params.period !== "ALL") {
      queryParams.period = params.period;
      if (params.period === "custom") {
        if (params?.from_date) queryParams.from_date = params.from_date;
        if (params?.to_date) queryParams.to_date = params.to_date;
      }
    }

    const res = await get<PaginatedApiResponse<InventoryLedgerEntry>>(
      `${LEDGER_BASE}/`,
      { params: queryParams }
    );
    return { data: res.data, pagination: res.pagination };
  },

  /**
   * GET /inventory-ledger/{entry_id} — fetch a single ledger entry by ID.
   */
  async getLedgerEntryById(entryId: string): Promise<InventoryLedgerEntry> {
    const res = await get<SuccessResponse<InventoryLedgerEntry>>(
      `${LEDGER_BASE}/${entryId}`
    );
    return res.data;
  },

  /**
   * GET /inventory-ledger/product/{product_id} — ledger entries for a specific product.
   * Supports: period, from_date, to_date (when period=custom), page, size.
   */
  async getLedgerByProduct(
    productId: string,
    params?: Pick<LedgerFilterParams, "page" | "size" | "period" | "from_date" | "to_date">
  ): Promise<PaginatedResponse<InventoryLedgerEntry>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: Math.min(params?.size ?? 20, 200),
    };

    if (params?.period && params.period !== "ALL") {
      queryParams.period = params.period;
      if (params.period === "custom") {
        if (params?.from_date) queryParams.from_date = params.from_date;
        if (params?.to_date) queryParams.to_date = params.to_date;
      }
    }

    const res = await get<PaginatedApiResponse<InventoryLedgerEntry>>(
      `${LEDGER_BASE}/product/${productId}`,
      { params: queryParams }
    );
    return { data: res.data, pagination: res.pagination };
  },

  /**
   * GET /inventory-ledger/reference/{reference_type}/{reference_id}
   * Fetch all ledger entries linked to a specific source document.
   */
  async getLedgerByReference(
    referenceType: string,
    referenceId: string
  ): Promise<InventoryLedgerEntry[]> {
    const res = await get<SuccessResponse<InventoryLedgerEntry[]>>(
      `${LEDGER_BASE}/reference/${referenceType}/${referenceId}`
    );
    return res.data;
  },

  /**
   * GET /stock-adjustments — paginated list with filters.
   * Supports: search, status, adjustment_type, period (day/week/month/custom),
   *           from_date, to_date (when period=custom), page, size.
   */
  async getStockAdjustments(
    params?: StockAdjustmentFilterParams
  ): Promise<PaginatedResponse<StockAdjustmentSummary>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    };

    if (params?.search) queryParams.search = params.search;
    if (params?.status && params.status !== "ALL") queryParams.status = params.status;
    if (params?.adjustment_type && params.adjustment_type !== "ALL")
      queryParams.adjustment_type = params.adjustment_type;
    if (params?.period && params.period !== "ALL") {
      queryParams.period = params.period;
      if (params.period === "custom") {
        if (params.from_date) queryParams.from_date = params.from_date;
        if (params.to_date) queryParams.to_date = params.to_date;
      }
    }

    const res = await get<PaginatedApiResponse<StockAdjustmentSummary>>(
      `${ADJUSTMENT_BASE}/`,
      { params: queryParams }
    );
    return { data: res.data, pagination: res.pagination };
  },

  /**
   * GET /stock-adjustments/{adjustment_id} — full detail with items and audit trail.
   */
  async getStockAdjustmentById(adjustmentId: string): Promise<StockAdjustment> {
    const res = await get<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}`
    );
    return res.data;
  },

  /**
   * POST /stock-adjustments/ — create a new draft adjustment.
   */
  async createStockAdjustment(
    payload: StockAdjustmentCreatePayload
  ): Promise<StockAdjustment> {
    const res = await post<SuccessResponse<StockAdjustment>>(`${ADJUSTMENT_BASE}/`, payload);
    return res.data;
  },

  /**
   * PUT /stock-adjustments/{adjustment_id} — update a draft adjustment.
   */
  async updateStockAdjustment(
    adjustmentId: string,
    payload: StockAdjustmentUpdatePayload
  ): Promise<StockAdjustment> {
    const res = await put<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}`,
      payload
    );
    return res.data;
  },

  /**
   * DELETE /stock-adjustments/{adjustment_id} — delete a draft adjustment.
   */
  async deleteStockAdjustment(adjustmentId: string): Promise<void> {
    await del<unknown>(`${ADJUSTMENT_BASE}/${adjustmentId}`);
  },

  /**
   * PATCH /stock-adjustments/{adjustment_id}/submit — submit draft for approval.
   */
  async submitStockAdjustment(adjustmentId: string): Promise<StockAdjustment> {
    const res = await patch<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}/submit`
    );
    return res.data;
  },

  /**
   * PATCH /stock-adjustments/{adjustment_id}/approve — approve adjustment (posts to ledger).
   */
  async approveStockAdjustment(adjustmentId: string): Promise<StockAdjustment> {
    const res = await patch<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}/approve`
    );
    return res.data;
  },

  /**
   * PATCH /stock-adjustments/{adjustment_id}/cancel — cancel a draft or submitted adjustment.
   */
  async cancelStockAdjustment(
    adjustmentId: string,
    reason?: string
  ): Promise<StockAdjustment> {
    const res = await patch<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}/cancel`,
      reason ? { reason } : undefined
    );
    return res.data;
  },
};
