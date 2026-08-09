/**
 * Master Data — Categories API
 */

import { get, post, put, del } from "@/lib/api/client";
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
    const apiParams: Record<string, unknown> = {};
    if (params) {
      if (params.page !== undefined) apiParams.page = params.page;
      if (params.page_size !== undefined) apiParams.size = params.page_size;
      if (params.is_active !== undefined) apiParams.active_only = params.is_active;
      if (params.search !== undefined) apiParams.search = params.search;
      if (params.ordering !== undefined) apiParams.ordering = params.ordering;
    }

    interface RawPaginatedResponse {
      status: "success";
      data: Category[];
      pagination: {
        page: number;
        size: number;
        total: number;
        pages: number;
      };
    }

    const res = await get<RawPaginatedResponse>(BASE, { params: apiParams });

    // Build a lookup map so we can resolve parent_id → { id, name, slug }
    // without an extra network call. The flat list contains both parent and
    // child categories, so this covers all cases for a single page.
    const lookup = new Map(
      (res.data ?? []).map((c) => [c.id, { id: c.id, name: c.name, slug: c.slug }])
    );

    const enriched = (res.data ?? []).map((c) => ({
      ...c,
      parent: c.parent_id ? (lookup.get(c.parent_id) ?? null) : null,
    }));

    return {
      status: res.status,
      data: enriched,
      pagination: {
        total: res.pagination?.total ?? 0,
        page: res.pagination?.page ?? 1,
        size: res.pagination?.size ?? 20,
        pages: res.pagination?.pages ?? 1,
      },
    };
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
    const res = await put<SuccessResponse<Category>>(`${BASE}/${id}`, data);
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
