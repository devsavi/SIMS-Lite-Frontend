// ---------------------------------------------------------------------------
// GRN Status
// ---------------------------------------------------------------------------

export type GRNStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED";

export type GRNPeriod = "day" | "week" | "month" | "custom";

// ---------------------------------------------------------------------------
// GRN Mode
// ---------------------------------------------------------------------------

export type GRNMode = "po_based" | "direct";

// ---------------------------------------------------------------------------
// Nested resource shapes (matching API responses)
// ---------------------------------------------------------------------------

export interface GRNSupplier {
  id: string;
  supplier_code: string;
  name: string;
  email: string;
  contact_person: string;
}

export interface GRNUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface GRNProduct {
  id: string;
  sku: string;
  name: string;
  barcode?: string;
}

// ---------------------------------------------------------------------------
// GRN Line Item
// ---------------------------------------------------------------------------

export interface GRNItem {
  id: string;
  grn_id: string;
  /** null for PO-less (direct) GRNs */
  po_item_id: string | null;
  product: GRNProduct;
  quantity_received: number;
  unit_cost: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// GRN List / Detail entity
// ---------------------------------------------------------------------------

export interface GoodsReceivedNote {
  id: string;
  grn_number: string;
  /** null for PO-less (direct) GRNs */
  purchase_order_id: string | null;
  /** null for PO-less (direct) GRNs */
  po_number: string | null;
  /** Optional / null for PO-less or test mock GRNs */
  supplier_id?: string | null;
  supplier: GRNSupplier;
  status: GRNStatus;
  received_date: string;
  delivery_note_number?: string | null;
  notes?: string | null;
  created_by: GRNUser;
  submitted_by?: GRNUser | null;
  submitted_at?: string | null;
  approved_by?: GRNUser | null;
  approved_at?: string | null;
  cancelled_by?: GRNUser | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  document_path?: string | null;
  document_original_name?: string | null;
  items: GRNItem[];
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface GRNFilters {
  search?: string;
  status?: GRNStatus | "ALL";
  period?: GRNPeriod;
  from_date?: string;
  to_date?: string;
  page?: number;
  size?: number;
}

// ---------------------------------------------------------------------------
// API Pagination wrapper
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface PaginatedGRNsResponse {
  status: string;
  data: GoodsReceivedNote[];
  pagination: PaginationMeta;
}

export interface GRNDetailResponse {
  status: string;
  data: GoodsReceivedNote;
}

// ---------------------------------------------------------------------------
// GRN Document response
// ---------------------------------------------------------------------------

export interface GRNDocumentResponse {
  status: string;
  data: {
    url: string;
    original_filename: string;
    expires_in_hours: number;
  };
}

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

/** Item for PO-based GRN — includes po_item_id */
export interface GRNItemRequestPOBased {
  po_item_id: string;
  product_id: string;
  quantity_received: number;
  unit_cost: number;
  notes?: string;
}

/** Item for PO-less (direct) GRN — po_item_id omitted entirely */
export interface GRNItemRequestDirect {
  product_id: string;
  quantity_received: number;
  unit_cost: number;
  notes?: string;
}

export type GRNItemRequest = GRNItemRequestPOBased | GRNItemRequestDirect;

/** PO-based create request */
export interface CreateGRNRequestPOBased {
  purchase_order_id: string;
  received_date: string;
  delivery_note_number?: string;
  notes?: string;
  items: GRNItemRequestPOBased[];
}

/** PO-less (direct) create request */
export interface CreateGRNRequestDirect {
  supplier_id: string;
  received_date: string;
  delivery_note_number?: string;
  notes?: string;
  items: GRNItemRequestDirect[];
}

export type CreateGRNRequest = CreateGRNRequestPOBased | CreateGRNRequestDirect;

export interface UpdateGRNRequest {
  received_date?: string;
  delivery_note_number?: string;
  notes?: string;
  items?: GRNItemRequest[];
}

export interface CancelGRNRequest {
  reason?: string;
}
