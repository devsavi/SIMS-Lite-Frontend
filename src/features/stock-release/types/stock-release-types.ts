/**
 * Stock Release feature — TypeScript type definitions
 */

export type StockReleaseStatus = "draft" | "submitted" | "approved" | "cancelled";

export interface StockReleaseItem {
  id?: string;
  release_id?: string;
  product_id: string;
  product_name?: string;
  product_sku?: string;
  sku?: string;
  quantity: number;
  available_quantity?: number;
  unit_of_measure: string;
  uom_code?: string;
  unit_price?: number;
  total_price?: number;
  notes?: string;
}

export interface ActivityHistoryItem {
  id: string;
  action: string; // e.g. "DRAFT_CREATED", "SUBMITTED", "APPROVED", "CANCELLED"
  actor_id?: string;
  actor_name?: string;
  actor_email?: string;
  timestamp: string;
  notes?: string;
}

export interface StockRelease {
  id: string;
  release_number: string;
  release_date: string;
  status: StockReleaseStatus;
  notes?: string | null;
  requested_by?: string | null;
  requested_by_user?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  created_by?: string | null;
  created_by_user?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  approved_by?: string | null;
  approved_by_user?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  total_items: number;
  total_quantity: number;
  items: StockReleaseItem[];
  history?: ActivityHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface StockReleaseFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: StockReleaseStatus | "ALL";
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateStockReleaseItemPayload {
  product_id: string;
  quantity: number;
  unit_of_measure: string;
  notes?: string;
}

export interface CreateStockReleasePayload {
  release_date: string;
  notes?: string;
  items: CreateStockReleaseItemPayload[];
}

export interface UpdateStockReleasePayload {
  release_date?: string;
  notes?: string;
  items?: CreateStockReleaseItemPayload[];
}
