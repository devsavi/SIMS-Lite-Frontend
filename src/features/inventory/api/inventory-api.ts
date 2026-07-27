import { get, post, patch } from "@/lib/api/client";
import type {
  InventoryFilterParams,
  InventoryItem,
  InventorySummary,
  InventoryValuationSummary,
  InventoryLedgerEntry,
  LedgerFilterParams,
  StockAdjustment,
  StockAdjustmentCreatePayload,
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

export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

const INVENTORY_BASE = "/api/v1/inventory";
const LEDGER_BASE = "/api/v1/inventory-ledger";
const ADJUSTMENT_BASE = "/api/v1/stock-adjustments";

export const inventoryApi = {
  /**
   * Fetch current inventory items with filters and pagination.
   */
  async getInventoryList(
    params?: InventoryFilterParams
  ): Promise<PaginatedResponse<InventoryItem>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    };

    if (params?.search) queryParams.search = params.search;
    if (params?.category_id && params.category_id !== "ALL")
      queryParams.category_id = params.category_id;
    if (params?.supplier_id && params.supplier_id !== "ALL")
      queryParams.supplier_id = params.supplier_id;
    if (params?.stock_status === "low_stock" || params?.low_stock_only)
      queryParams.low_stock_only = true;
    if (params?.stock_status === "out_of_stock" || params?.out_of_stock_only)
      queryParams.out_of_stock_only = true;

    return get<PaginatedResponse<InventoryItem>>(INVENTORY_BASE, {
      params: queryParams,
    });
  },

  /**
   * Fetch overall inventory aggregate summary.
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
   * Fetch single product stock information.
   */
  async getInventoryByProductId(productId: string): Promise<InventoryItem> {
    const res = await get<SuccessResponse<InventoryItem>>(`${INVENTORY_BASE}/${productId}`);
    return res.data;
  },

  /**
   * Fetch paginated inventory ledger entries.
   */
  async getLedgerEntries(
    params?: LedgerFilterParams
  ): Promise<PaginatedResponse<InventoryLedgerEntry>> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    };

    if (params?.product_id) queryParams.product_id = params.product_id;
    if (params?.entry_type && params.entry_type !== "ALL")
      queryParams.entry_type = params.entry_type;
    if (params?.reference_type && params.reference_type !== "ALL")
      queryParams.reference_type = params.reference_type;
    if (params?.from_date) queryParams.from_date = params.from_date;
    if (params?.to_date) queryParams.to_date = params.to_date;

    return get<PaginatedResponse<InventoryLedgerEntry>>(`${LEDGER_BASE}/`, {
      params: queryParams,
    });
  },

  /**
   * Fetch ledger entries for a specific product.
   */
  async getLedgerByProduct(
    productId: string,
    page = 1,
    size = 20
  ): Promise<PaginatedResponse<InventoryLedgerEntry>> {
    return get<PaginatedResponse<InventoryLedgerEntry>>(
      `${LEDGER_BASE}/product/${productId}`,
      { params: { page, size } }
    );
  },

  /**
   * Create stock adjustment draft or execute stock adjustment.
   */
  async createStockAdjustment(
    payload: StockAdjustmentCreatePayload
  ): Promise<StockAdjustment> {
    const res = await post<SuccessResponse<StockAdjustment>>(`${ADJUSTMENT_BASE}/`, payload);
    return res.data;
  },

  /**
   * Submit draft stock adjustment.
   */
  async submitStockAdjustment(adjustmentId: string): Promise<StockAdjustment> {
    const res = await patch<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}/submit`
    );
    return res.data;
  },

  /**
   * Approve stock adjustment (immediately updates inventory stock).
   */
  async approveStockAdjustment(adjustmentId: string): Promise<StockAdjustment> {
    const res = await patch<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}/approve`
    );
    return res.data;
  },

  /**
   * Cancel stock adjustment.
   */
  async cancelStockAdjustment(
    adjustmentId: string,
    reason: string
  ): Promise<StockAdjustment> {
    const res = await patch<SuccessResponse<StockAdjustment>>(
      `${ADJUSTMENT_BASE}/${adjustmentId}/cancel`,
      { reason }
    );
    return res.data;
  },
};
