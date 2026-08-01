/**
 * Master Data — Units of Measure API
 */

import { get, post, put, del } from "@/lib/api/client";
import type {
  UnitOfMeasure,
  CreateUomRequest,
  UpdateUomRequest,
  ListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/uoms";

function mapUom(raw: any): UnitOfMeasure {
  return {
    id: raw.id,
    name: raw.name,
    symbol: raw.symbol,
    description: raw.description,
    is_active: raw.is_active,
    createdAt: raw.created_at || raw.createdAt || "",
    updatedAt: raw.updated_at || raw.updatedAt || "",
  };
}

export const uomsApi = {
  list: async (params?: ListParams): Promise<PaginatedListResponse<UnitOfMeasure>> => {
    const apiParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) apiParams.page = params.page;
      if (params.page_size !== undefined) apiParams.size = params.page_size;
      if (params.is_active !== undefined) apiParams.active_only = params.is_active;
      if (params.search !== undefined) apiParams.search = params.search;
      if (params.ordering !== undefined) apiParams.ordering = params.ordering;
    }

    interface NewPaginatedResponse {
      status: "success";
      data: any[];
      pagination: {
        page: number;
        size: number;
        total: number;
        pages: number;
      };
    }

    const res = await get<NewPaginatedResponse>(BASE, { params: apiParams });
    return {
      status: res.status,
      data: (res.data || []).map(mapUom),
      pagination: {
        total: res.pagination?.total ?? 0,
        page: res.pagination?.page ?? 1,
        size: res.pagination?.size ?? 20,
        pages: res.pagination?.pages ?? 1,
      },
    };
  },

  getById: async (id: string): Promise<UnitOfMeasure> => {
    const res = await get<SuccessResponse<any>>(`${BASE}/${id}`);
    return mapUom(res.data);
  },

  create: async (data: CreateUomRequest): Promise<UnitOfMeasure> => {
    const payload = {
      name: data.name,
      symbol: data.symbol,
      description: data.description || null,
      is_active: data.is_active ?? true,
    };
    const res = await post<SuccessResponse<any>>(BASE, payload);
    return mapUom(res.data);
  },

  update: async (id: string, data: UpdateUomRequest): Promise<UnitOfMeasure> => {
    const payload = {
      name: data.name,
      symbol: data.symbol,
      description: data.description || null,
      is_active: data.is_active ?? true,
    };
    const res = await put<SuccessResponse<any>>(`${BASE}/${id}`, payload);
    return mapUom(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<UnitOfMeasure> => {
    const res = await post<SuccessResponse<any>>(`${BASE}/${id}/restore`);
    return mapUom(res.data);
  },
};

