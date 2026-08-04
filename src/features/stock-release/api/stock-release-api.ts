import { get, post, put, patch, del } from "@/lib/api/client";
import type {
  StockRelease,
  StockReleaseSummary,
  StockReleaseFilterParams,
  CreateStockReleasePayload,
  UpdateStockReleasePayload,
} from "../types/stock-release-types";

export interface PaginatedStockReleaseResponse {
  data: StockReleaseSummary[];
  pagination: {
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

const BASE = "/stock-releases";

export const stockReleaseApi = {
  /**
   * GET /stock-releases — paginated list with filters
   */
  async getStockReleases(
    params?: StockReleaseFilterParams
  ): Promise<PaginatedStockReleaseResponse> {
    const query: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    };

    if (params?.search) query.search = params.search;
    if (params?.status && params.status !== "ALL") query.status = params.status;
    if (params?.purpose && params.purpose !== "ALL") query.purpose = params.purpose;

    // Period handling
    if (params?.period && params.period !== "ALL") {
      query.period = params.period;
      if (params.period === "custom") {
        if (params.from_date) query.from_date = params.from_date;
        if (params.to_date) query.to_date = params.to_date;
      }
    }

    const res = await get<ApiSuccessWrapper<StockReleaseSummary[]> | PaginatedStockReleaseResponse>(
      BASE,
      { params: query }
    );

    // Normalise: API wraps data under { status, data, pagination }
    if ("data" in res && Array.isArray(res.data)) {
      const r = res as PaginatedStockReleaseResponse;
      return {
        data: r.data,
        pagination: r.pagination ?? {
          page: params?.page ?? 1,
          size: params?.size ?? 20,
          total: r.data.length,
          pages: 1,
        },
      };
    }

    return res as PaginatedStockReleaseResponse;
  },

  /**
   * GET /stock-releases/{id} — single release detail
   */
  async getStockReleaseById(id: string): Promise<StockRelease> {
    const res = await get<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${BASE}/${id}`
    );
    if ("data" in res && res.data && !Array.isArray(res.data)) {
      return (res as ApiSuccessWrapper<StockRelease>).data;
    }
    return res as StockRelease;
  },

  /**
   * POST /stock-releases — create draft
   */
  async createStockRelease(
    payload: CreateStockReleasePayload
  ): Promise<StockRelease> {
    const res = await post<ApiSuccessWrapper<StockRelease> | StockRelease>(
      BASE,
      payload
    );
    if ("data" in res && res.data && !Array.isArray(res.data)) {
      return (res as ApiSuccessWrapper<StockRelease>).data;
    }
    return res as StockRelease;
  },

  /**
   * PUT /stock-releases/{id} — update draft
   */
  async updateStockRelease(
    id: string,
    payload: UpdateStockReleasePayload
  ): Promise<StockRelease> {
    const res = await put<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${BASE}/${id}`,
      payload
    );
    if ("data" in res && res.data && !Array.isArray(res.data)) {
      return (res as ApiSuccessWrapper<StockRelease>).data;
    }
    return res as StockRelease;
  },

  /**
   * DELETE /stock-releases/{id} — delete a draft release
   */
  async deleteStockRelease(id: string): Promise<void> {
    await del<unknown>(`${BASE}/${id}`);
  },

  /**
   * PATCH /stock-releases/{id}/submit
   */
  async submitStockRelease(id: string): Promise<StockRelease> {
    const res = await patch<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${BASE}/${id}/submit`
    );
    if ("data" in res && res.data && !Array.isArray(res.data)) {
      return (res as ApiSuccessWrapper<StockRelease>).data;
    }
    return res as StockRelease;
  },

  /**
   * PATCH /stock-releases/{id}/approve
   */
  async approveStockRelease(id: string): Promise<StockRelease> {
    const res = await patch<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${BASE}/${id}/approve`
    );
    if ("data" in res && res.data && !Array.isArray(res.data)) {
      return (res as ApiSuccessWrapper<StockRelease>).data;
    }
    return res as StockRelease;
  },

  /**
   * PATCH /stock-releases/{id}/cancel
   */
  async cancelStockRelease(id: string, reason?: string): Promise<StockRelease> {
    const res = await patch<ApiSuccessWrapper<StockRelease> | StockRelease>(
      `${BASE}/${id}/cancel`,
      reason ? { reason } : undefined
    );
    if ("data" in res && res.data && !Array.isArray(res.data)) {
      return (res as ApiSuccessWrapper<StockRelease>).data;
    }
    return res as StockRelease;
  },
};
