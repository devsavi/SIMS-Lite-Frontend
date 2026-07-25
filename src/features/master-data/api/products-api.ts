/**
 * Master Data — Products API
 */

import { get, post, patch, del } from "@/lib/api/client";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/products";

export const productsApi = {
  list: async (params?: ProductListParams): Promise<PaginatedListResponse<Product>> => {
    return get<PaginatedListResponse<Product>>(BASE, { params });
  },

  getById: async (id: string): Promise<Product> => {
    const res = await get<SuccessResponse<Product>>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const res = await post<SuccessResponse<Product>>(BASE, data);
    return res.data;
  },

  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const res = await patch<SuccessResponse<Product>>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<Product> => {
    const res = await post<SuccessResponse<Product>>(`${BASE}/${id}/restore`);
    return res.data;
  },
};
