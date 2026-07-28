import { get, post, put, patch } from "@/lib/api/client";
import type {
  StockRelease,
  StockReleaseFilterParams,
  CreateStockReleasePayload,
  UpdateStockReleasePayload,
} from "../types/stock-release-types";

export interface PaginatedStockReleaseResponse {
  data: StockRelease[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  pagination?: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface ApiSuccessWrapper<T> {
  data: T;
  message?: string;
  status?: string;
}

const STOCK_RELEASE_BASE = "/api/v1/stock-releases";

export const stockReleaseApi = {
  /**
   * Fetch paginated list of stock releases with filters
   */
  async getStockReleases(
    params?: StockReleaseFilterParams
  ): Promise<PaginatedStockReleaseResponse> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    };

    if (params?.search) queryParams.search = params.search;
    if (params?.status && params.status !== "ALL") queryParams.status = params.status;
    if (params?.from_date) queryParams.from_date = params.from_date;
    if (params?.to_date) queryParams.to_date = params.to_date;
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.sort_order) queryParams.sort_order = params.sort_order;

    const res = await get<PaginatedStockReleaseResponse | ApiSuccessWrapper<PaginatedStockReleaseResponse> | StockRelease[]>(
      STOCK_RELEASE_BASE,
      { params: queryParams }
    );

    if (Array.isArray(res)) {
      return {
        data: res,
        total: res.length,
        page: params?.page ?? 1,
        pageSize: params?.size ?? 20,
        totalPages: 1,
      };
    }

    if ("data" in res && Array.isArray(res.data)) {
      return {
        data: res.data,
        total: (res as PaginatedStockReleaseResponse).total ?? (res as PaginatedStockReleaseResponse).pagination?.total ?? res.data.length,
        page: (res as PaginatedStockReleaseResponse).page ?? (res as PaginatedStockReleaseResponse).pagination?.page ?? 1,
        pageSize: (res as PaginatedStockReleaseResponse).pageSize ?? (res as PaginatedStockReleaseResponse).pagination?.size ?? 20,
        totalPages: (res as PaginatedStockReleaseResponse).totalPages ?? (res as PaginatedStockReleaseResponse).pagination?.pages ?? 1,
        pagination: (res as PaginatedStockReleaseResponse).pagination,
      };
    }

    return res as PaginatedStockReleaseResponse;
  },

  /**
   * Fetch stock release detail by ID
   */
  async getStockReleaseById(id: string): Promise<StockRelease> {
    const res = await get<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${STOCK_RELEASE_BASE}/${id}`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as StockRelease;
  },

  /**
   * Create new stock release draft
   */
  async createStockRelease(
    payload: CreateStockReleasePayload
  ): Promise<StockRelease> {
    const res = await post<ApiSuccessWrapper<StockRelease> | StockRelease>(
      STOCK_RELEASE_BASE,
      payload
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as StockRelease;
  },

  /**
   * Update draft stock release
   */
  async updateStockRelease(
    id: string,
    payload: UpdateStockReleasePayload
  ): Promise<StockRelease> {
    const res = await put<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${STOCK_RELEASE_BASE}/${id}`,
      payload
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as StockRelease;
  },

  /**
   * Submit draft stock release
   */
  async submitStockRelease(id: string): Promise<StockRelease> {
    const res = await patch<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${STOCK_RELEASE_BASE}/${id}/submit`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as StockRelease;
  },

  /**
   * Approve stock release (deducts stock and updates inventory)
   */
  async approveStockRelease(id: string): Promise<StockRelease> {
    const res = await patch<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${STOCK_RELEASE_BASE}/${id}/approve`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as StockRelease;
  },

  /**
   * Cancel stock release
   */
  async cancelStockRelease(id: string, reason?: string): Promise<StockRelease> {
    const res = await patch<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${STOCK_RELEASE_BASE}/${id}/cancel`,
      { reason }
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as StockRelease;
  },
};
