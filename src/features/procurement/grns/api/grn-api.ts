import { get, post, put, patch, del } from "@/lib/api/client";
import type {
  PaginatedGRNsResponse,
  GRNDetailResponse,
  GRNDocumentResponse,
  GRNFilters,
  CreateGRNRequest,
  UpdateGRNRequest,
  GoodsReceivedNote,
} from "../types";

// ---------------------------------------------------------------------------
// GET /grns — list with filters
// ---------------------------------------------------------------------------

export async function fetchGRNs(
  filters: GRNFilters = {}
): Promise<PaginatedGRNsResponse> {
  const params: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    size: filters.size ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.period) params.period = filters.period;
  if (filters.period === "custom") {
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
  }

  return get<PaginatedGRNsResponse>("/grns", { params });
}

// ---------------------------------------------------------------------------
// GET /grns/{grn_id} — detail
// ---------------------------------------------------------------------------

export async function fetchGRNById(id: string): Promise<GRNDetailResponse> {
  return get<GRNDetailResponse>(`/grns/${id}`);
}

// ---------------------------------------------------------------------------
// POST /grns — create
// ---------------------------------------------------------------------------

export async function createGRN(
  data: CreateGRNRequest
): Promise<GoodsReceivedNote> {
  const res = await post<{ status: string; data: GoodsReceivedNote }>(
    "/grns",
    data
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PUT /grns/{grn_id} — update draft
// ---------------------------------------------------------------------------

export async function updateGRN(
  id: string,
  data: UpdateGRNRequest
): Promise<GoodsReceivedNote> {
  const res = await put<{ status: string; data: GoodsReceivedNote }>(
    `/grns/${id}`,
    data
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PATCH /grns/{grn_id}/submit
// ---------------------------------------------------------------------------

export async function submitGRN(id: string): Promise<GoodsReceivedNote> {
  const res = await patch<{ status: string; data: GoodsReceivedNote }>(
    `/grns/${id}/submit`
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PATCH /grns/{grn_id}/approve
// ---------------------------------------------------------------------------

export async function approveGRN(id: string): Promise<GoodsReceivedNote> {
  const res = await patch<{ status: string; data: GoodsReceivedNote }>(
    `/grns/${id}/approve`
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// PATCH /grns/{grn_id}/cancel
// ---------------------------------------------------------------------------

export async function cancelGRN(id: string): Promise<GoodsReceivedNote> {
  const res = await patch<{ status: string; data: GoodsReceivedNote }>(
    `/grns/${id}/cancel`
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// POST /grns/{grn_id}/document — upload document (multipart/form-data)
// ---------------------------------------------------------------------------

export async function uploadGRNDocument(
  id: string,
  file: File
): Promise<{ status: string; message?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return post<{ status: string; message?: string }>(
    `/grns/${id}/document`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
}

// ---------------------------------------------------------------------------
// GET /grns/{grn_id}/document — get signed document URL
// ---------------------------------------------------------------------------

export async function fetchGRNDocument(
  id: string,
  expiresHours = 1
): Promise<GRNDocumentResponse> {
  return get<GRNDocumentResponse>(`/grns/${id}/document`, {
    params: { expires_hours: expiresHours },
  });
}

// ---------------------------------------------------------------------------
// DELETE /grns/{grn_id}/document — delete document
// ---------------------------------------------------------------------------

export async function deleteGRNDocument(id: string): Promise<void> {
  await del(`/grns/${id}/document`);
}
