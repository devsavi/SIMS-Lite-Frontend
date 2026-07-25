/**
 * Master Data — Units of Measure API
 */

import { get, post, patch, del } from "@/lib/api/client";
import type {
  UnitOfMeasure,
  CreateUomRequest,
  UpdateUomRequest,
  ListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/uoms";

export const uomsApi = {
  list: async (params?: ListParams): Promise<PaginatedListResponse<UnitOfMeasure>> => {
    return get<PaginatedListResponse<UnitOfMeasure>>(BASE, { params });
  },

  getById: async (id: string): Promise<UnitOfMeasure> => {
    const res = await get<SuccessResponse<UnitOfMeasure>>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: CreateUomRequest): Promise<UnitOfMeasure> => {
    const res = await post<SuccessResponse<UnitOfMeasure>>(BASE, data);
    return res.data;
  },

  update: async (id: string, data: UpdateUomRequest): Promise<UnitOfMeasure> => {
    const res = await patch<SuccessResponse<UnitOfMeasure>>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<UnitOfMeasure> => {
    const res = await post<SuccessResponse<UnitOfMeasure>>(`${BASE}/${id}/restore`);
    return res.data;
  },
};
