/**
 * Stock Release feature — TypeScript type definitions
 */

export type StockReleaseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED";

export type StockReleasePurpose =
  | "INTERNAL_USE"
  | "PRODUCTION"
  | "MAINTENANCE"
  | "SALES"
  | "SAMPLE"
  | "DISPOSAL"
  | "OTHER";

export type StockReleasePeriod = "day" | "week" | "month" | "custom";

export interface ReleaseActor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface StockReleaseItemProduct {
  id: string;
  sku: string;
  name: string;
  barcode?: string | null;
  reorder_level?: number;
  cost_price?: number;
  selling_price?: number;
}

export interface StockReleaseItem {
  id?: string;
  stock_release_id?: string;
  product: StockReleaseItemProduct;
  /** For backward compat with older parts of the UI that read item.product_id */
  product_id?: string;
  quantity_requested: number;
  unit_cost: number;
  line_total: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
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

/** Shape returned by GET /stock-releases (list) */
export interface StockReleaseSummary {
  id: string;
  release_number: string;
  purpose: StockReleasePurpose;
  status: StockReleaseStatus;
  release_date: string;
  total_quantity: number;
  total_cost: number;
  item_count: number;
  created_by: ReleaseActor;
  created_at: string;
}

/** Shape returned by GET /stock-releases/{id} (detail) */
export interface StockRelease {
  id: string;
  release_number: string;
  purpose: StockReleasePurpose;
  status: StockReleaseStatus;
  release_date: string;
  notes?: string | null;
  reference_document?: string | null;
  total_quantity: number;
  total_cost: number;
  created_by: ReleaseActor | null;
  submitted_by?: ReleaseActor | null;
  submitted_at?: string | null;
  approved_by?: ReleaseActor | null;
  approved_at?: string | null;
  cancelled_by?: ReleaseActor | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
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
  purpose?: StockReleasePurpose | "ALL";
  period?: StockReleasePeriod | "ALL";
  from_date?: string;
  to_date?: string;
}

export interface CreateStockReleaseItemPayload {
  product_id: string;
  quantity_requested: number;
  notes?: string;
}

export interface CreateStockReleasePayload {
  purpose: StockReleasePurpose;
  release_date: string;
  notes?: string;
  reference_document?: string;
  items: CreateStockReleaseItemPayload[];
}

export interface UpdateStockReleasePayload {
  purpose?: StockReleasePurpose;
  release_date?: string;
  notes?: string;
  reference_document?: string;
  items?: CreateStockReleaseItemPayload[];
}
