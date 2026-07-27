import { get, post, put } from "@/lib/api/client";
import type {
  GoodsReceivedNote,
  GRNFilters,
  CreateGRNRequest,
} from "../types";

export interface PaginatedGRNsResponse {
  data: GoodsReceivedNote[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchGRNs(
  filters: GRNFilters = {}
): Promise<PaginatedGRNsResponse> {
  const params: Record<string, string | number | undefined> = {
    search: filters.search || undefined,
    status: filters.status !== "ALL" ? filters.status : undefined,
    supplier_id: filters.supplierId !== "ALL" ? filters.supplierId : undefined,
    purchase_order_id: filters.purchaseOrderId || undefined,
    start_date: filters.startDate || undefined,
    end_date: filters.endDate || undefined,
    page: filters.page || 1,
    limit: filters.limit || 10,
    sort_by: filters.sortBy || "createdAt",
    sort_order: filters.sortOrder || "desc",
  };

  return get<PaginatedGRNsResponse>("/api/v1/grns", { params });
}

export async function fetchGRNById(id: string): Promise<GoodsReceivedNote> {
  return get<GoodsReceivedNote>(`/api/v1/grns/${id}`);
}

export async function createGRN(
  data: CreateGRNRequest
): Promise<GoodsReceivedNote> {
  return post<GoodsReceivedNote>("/api/v1/grns", data);
}

export async function submitGRN(id: string): Promise<GoodsReceivedNote> {
  return post<GoodsReceivedNote>(`/api/v1/grns/${id}/submit`);
}

export async function approveGRN(id: string): Promise<GoodsReceivedNote> {
  return post<GoodsReceivedNote>(`/api/v1/grns/${id}/approve`);
}
