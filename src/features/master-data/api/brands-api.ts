/**
 * Master Data — Brands API
 */

import { get, post, put, del } from "@/lib/api/client";
import type {
  Brand,
  CreateBrandRequest,
  UpdateBrandRequest,
  ListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/brands";

function mapBrand(raw: any): Brand {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug || "",
    description: raw.description,
    logo_url: raw.logo_url,
    website_url: raw.website,
    is_active: raw.is_active,
    createdAt: raw.created_at || raw.createdAt || "",
    updatedAt: raw.updated_at || raw.updatedAt || "",
    product_count: raw.product_count,
  };
}

export const brandsApi = {
  list: async (params?: ListParams): Promise<PaginatedListResponse<Brand>> => {
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
      data: (res.data || []).map(mapBrand),
      pagination: {
        total: res.pagination?.total ?? 0,
        page: res.pagination?.page ?? 1,
        size: res.pagination?.size ?? 20,
        pages: res.pagination?.pages ?? 1,
      },
    };
  },

  getById: async (id: string): Promise<Brand> => {
    const res = await get<SuccessResponse<any>>(`${BASE}/${id}`);
    return mapBrand(res.data);
  },

  create: async (data: CreateBrandRequest): Promise<Brand> => {
    const payload = {
      name: data.name,
      description: data.description || null,
      logo_url: data.logo_url || null,
      website: data.website_url || null,
      is_active: data.is_active,
    };
    const res = await post<SuccessResponse<any>>(BASE, payload);
    return mapBrand(res.data);
  },

  update: async (id: string, data: UpdateBrandRequest): Promise<Brand> => {
    const payload = {
      name: data.name,
      description: data.description || null,
      logo_url: data.logo_url || null,
      website: data.website_url || null,
      is_active: data.is_active,
    };
    const res = await put<SuccessResponse<any>>(`${BASE}/${id}`, payload);
    return mapBrand(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<Brand> => {
    const res = await post<SuccessResponse<any>>(`${BASE}/${id}/restore`);
    return mapBrand(res.data);
  },
};

