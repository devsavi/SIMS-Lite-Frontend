import { get, post, put, patch } from "@/lib/api/client";
import type {
  PurchaseOrder,
  POFilters,
  CreatePORequest,
  UpdatePORequest,
} from "../types";

export interface PaginatedPOsResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchPurchaseOrders(
  filters: POFilters = {}
): Promise<PaginatedPOsResponse> {
  const params: Record<string, string | number | undefined> = {
    search: filters.search || undefined,
    status: filters.status !== "ALL" ? filters.status : undefined,
    supplier_id: filters.supplierId !== "ALL" ? filters.supplierId : undefined,
    start_date: filters.startDate || undefined,
    end_date: filters.endDate || undefined,
    page: filters.page || 1,
    limit: filters.limit || 10,
    sort_by: filters.sortBy || "createdAt",
    sort_order: filters.sortOrder || "desc",
  };

  return get<PaginatedPOsResponse>("/api/v1/purchase-orders", { params });
}

export async function fetchPurchaseOrderById(id: string): Promise<PurchaseOrder> {
  return get<PurchaseOrder>(`/api/v1/purchase-orders/${id}`);
}

export async function createPurchaseOrder(
  data: CreatePORequest
): Promise<PurchaseOrder> {
  return post<PurchaseOrder>("/api/v1/purchase-orders", data);
}

export async function updatePurchaseOrder(
  id: string,
  data: UpdatePORequest
): Promise<PurchaseOrder> {
  return put<PurchaseOrder>(`/api/v1/purchase-orders/${id}`, data);
}

export async function submitPurchaseOrder(id: string): Promise<PurchaseOrder> {
  return post<PurchaseOrder>(`/api/v1/purchase-orders/${id}/submit`);
}

export async function approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
  return post<PurchaseOrder>(`/api/v1/purchase-orders/${id}/approve`);
}

export async function rejectPurchaseOrder(
  id: string,
  reason?: string
): Promise<PurchaseOrder> {
  return post<PurchaseOrder>(`/api/v1/purchase-orders/${id}/reject`, { reason });
}

export async function cancelPurchaseOrder(
  id: string,
  reason?: string
): Promise<PurchaseOrder> {
  return post<PurchaseOrder>(`/api/v1/purchase-orders/${id}/cancel`, { reason });
}

export async function resendPOEmail(id: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(
    `/api/v1/purchase-orders/${id}/resend-email`
  );
}

export async function exportPurchaseOrders(filters: POFilters = {}): Promise<Blob> {
  const response = await get<Blob>("/api/v1/purchase-orders/export", {
    params: filters,
    responseType: "blob",
  });
  return response;
}
