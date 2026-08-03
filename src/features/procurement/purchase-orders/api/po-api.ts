import { get, post, put, patch, del } from "@/lib/api/client";
import type {
  PaginatedPOsResponse,
  PODetailResponse,
  POPrintResponse,
  POFilters,
  CreatePORequest,
  UpdatePORequest,
  RejectPORequest,
  CancelPORequest,
  EmailPORequest,
  PurchaseOrder,
  PurchaseOrderListItem,
} from "../types";

// ---------------------------------------------------------------------------
// GET /purchase-orders — list with filters
// ---------------------------------------------------------------------------

export async function fetchPurchaseOrders(
  filters: POFilters = {}
): Promise<PaginatedPOsResponse> {
  const params: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    size: filters.size ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.supplier_id && filters.supplier_id !== "ALL")
    params.supplier_id = filters.supplier_id;
  if (filters.period) params.period = filters.period;
  if (filters.period === "custom") {
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
  }

  return get<PaginatedPOsResponse>("/purchase-orders", { params });
}

// ---------------------------------------------------------------------------
// GET /purchase-orders/{po_id} — detail
// ---------------------------------------------------------------------------

export async function fetchPurchaseOrderById(
  id: string
): Promise<PODetailResponse> {
  return get<PODetailResponse>(`/purchase-orders/${id}`);
}

// ---------------------------------------------------------------------------
// POST /purchase-orders — create
// ---------------------------------------------------------------------------

export async function createPurchaseOrder(
  data: CreatePORequest
): Promise<PurchaseOrder> {
  const res = await post<{ status: string; data: PurchaseOrder }>(
    "/purchase-orders",
    data
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PUT /purchase-orders/{po_id} — update draft
// ---------------------------------------------------------------------------

export async function updatePurchaseOrder(
  id: string,
  data: UpdatePORequest
): Promise<PurchaseOrder> {
  const res = await put<{ status: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}`,
    data
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// DELETE /purchase-orders/{po_id} — delete draft
// ---------------------------------------------------------------------------

export async function deletePurchaseOrder(id: string): Promise<void> {
  await del(`/purchase-orders/${id}`);
}

// ---------------------------------------------------------------------------
// PATCH /purchase-orders/{po_id}/submit
// ---------------------------------------------------------------------------

export async function submitPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await patch<{ status: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/submit`
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PATCH /purchase-orders/{po_id}/approve
// ---------------------------------------------------------------------------

export async function approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await patch<{ status: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/approve`
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PATCH /purchase-orders/{po_id}/reject
// ---------------------------------------------------------------------------

export async function rejectPurchaseOrder(
  id: string,
  body: RejectPORequest
): Promise<PurchaseOrder> {
  const res = await patch<{ status: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/reject`,
    body
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PATCH /purchase-orders/{po_id}/cancel
// ---------------------------------------------------------------------------

export async function cancelPurchaseOrder(
  id: string,
  body: CancelPORequest
): Promise<PurchaseOrder> {
  const res = await patch<{ status: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/cancel`,
    body
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// POST /purchase-orders/{po_id}/duplicate
// ---------------------------------------------------------------------------

export async function duplicatePurchaseOrder(
  id: string
): Promise<PurchaseOrder> {
  const res = await post<{ status: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/duplicate`
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// GET /purchase-orders/{po_id}/print
// ---------------------------------------------------------------------------

export async function fetchPurchaseOrderPrint(
  id: string
): Promise<POPrintResponse> {
  return get<POPrintResponse>(`/purchase-orders/${id}/print`);
}

// ---------------------------------------------------------------------------
// POST /purchase-orders/{po_id}/email
// ---------------------------------------------------------------------------

export async function emailPurchaseOrder(
  id: string,
  body: EmailPORequest
): Promise<{ status: string; message: string }> {
  return post<{ status: string; message: string }>(
    `/purchase-orders/${id}/email`,
    body
  );
}
