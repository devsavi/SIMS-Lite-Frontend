/**
 * Master Data — Suppliers API
 */

import { get, post, put, del } from "@/lib/api/client";
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  ListParams,
  PaginatedListResponse,
  SuccessResponse,
} from "../types";

const BASE = "/suppliers";

function mapSupplier(raw: any): Supplier {
  return {
    id: raw.id,
    company_name: raw.name || raw.company_name || "",
    contact_person: raw.contact_person,
    email: raw.email,
    phone: raw.phone,
    address: raw.address,
    city: raw.city,
    country: raw.country,
    notes: raw.notes,
    is_active: raw.is_active,
    createdAt: raw.created_at || raw.createdAt || "",
    updatedAt: raw.updated_at || raw.updatedAt || "",
    product_count: raw.product_count,
  };
}

export const suppliersApi = {
  list: async (params?: ListParams): Promise<PaginatedListResponse<Supplier>> => {
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
      data: (res.data || []).map(mapSupplier),
      pagination: {
        total: res.pagination?.total ?? 0,
        page: res.pagination?.page ?? 1,
        size: res.pagination?.size ?? 20,
        pages: res.pagination?.pages ?? 1,
      },
    };
  },

  getById: async (id: string): Promise<Supplier> => {
    const res = await get<SuccessResponse<any>>(`${BASE}/${id}`);
    return mapSupplier(res.data);
  },

  create: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const payload = {
      supplier_code: (data as any).supplier_code || `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.company_name,
      contact_person: data.contact_person || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: (data as any).state || "",
      country: data.country || "",
      postal_code: (data as any).postal_code || "",
      tax_id: (data as any).tax_id || "",
      payment_terms: (data as any).payment_terms || "",
      notes: data.notes || null,
      is_active: data.is_active ?? true,
    };
    const res = await post<SuccessResponse<any>>(BASE, payload);
    return mapSupplier(res.data);
  },

  update: async (id: string, data: UpdateSupplierRequest): Promise<Supplier> => {
    const payload = {
      supplier_code: (data as any).supplier_code || `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.company_name,
      contact_person: data.contact_person || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: (data as any).state || "",
      country: data.country || "",
      postal_code: (data as any).postal_code || "",
      tax_id: (data as any).tax_id || "",
      payment_terms: (data as any).payment_terms || "",
      notes: data.notes || null,
      is_active: data.is_active ?? true,
    };
    const res = await put<SuccessResponse<any>>(`${BASE}/${id}`, payload);
    return mapSupplier(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<Supplier> => {
    const res = await post<SuccessResponse<any>>(`${BASE}/${id}/restore`);
    return mapSupplier(res.data);
  },
};

