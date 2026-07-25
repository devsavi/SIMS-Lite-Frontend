/**
 * Master Data — Brands API
 */

import { get, post, patch, del } from "@/lib/api/client";
import type {
  Brand,
  CreateBrandRequest,
  UpdateBrandRequest,
  ListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/brands";

export const brandsApi = {
  list: async (params?: ListParams): Promise<PaginatedListResponse<Brand>> => {
    return get<PaginatedListResponse<Brand>>(BASE, { params });
  },

  getById: async (id: string): Promise<Brand> => {
    const res = await get<SuccessResponse<Brand>>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: CreateBrandRequest): Promise<Brand> => {
    const res = await post<SuccessResponse<Brand>>(BASE, data);
    return res.data;
  },

  update: async (id: string, data: UpdateBrandRequest): Promise<Brand> => {
    const res = await patch<SuccessResponse<Brand>>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<Brand> => {
    const res = await post<SuccessResponse<Brand>>(`${BASE}/${id}/restore`);
    return res.data;
  },
};
