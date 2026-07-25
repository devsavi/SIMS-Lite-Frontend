/**
 * Master Data — Categories API
 */

import { get, post, put, patch, del } from "@/lib/api/client";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/categories";

export const categoriesApi = {
  list: async (params?: ListParams): Promise<PaginatedListResponse<Category>> => {
    return get<PaginatedListResponse<Category>>(BASE, { params });
  },

  getById: async (id: string): Promise<Category> => {
    const res = await get<SuccessResponse<Category>>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const res = await post<SuccessResponse<Category>>(BASE, data);
    return res.data;
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const res = await patch<SuccessResponse<Category>>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<Category> => {
    const res = await post<SuccessResponse<Category>>(`${BASE}/${id}/restore`);
    return res.data;
  },
};
