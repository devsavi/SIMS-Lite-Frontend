/**
 * Master Data — Suppliers API
 */

import { get, post, patch, del } from "@/lib/api/client";
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  ListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/suppliers";

export const suppliersApi = {
  list: async (params?: ListParams): Promise<PaginatedListResponse<Supplier>> => {
    return get<PaginatedListResponse<Supplier>>(BASE, { params });
  },

  getById: async (id: string): Promise<Supplier> => {
    const res = await get<SuccessResponse<Supplier>>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const res = await post<SuccessResponse<Supplier>>(BASE, data);
    return res.data;
  },

  update: async (id: string, data: UpdateSupplierRequest): Promise<Supplier> => {
    const res = await patch<SuccessResponse<Supplier>>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<Supplier> => {
    const res = await post<SuccessResponse<Supplier>>(`${BASE}/${id}/restore`);
    return res.data;
  },
};
