export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface CategoryRef {
  id: string;
  name: string;
  slug?: string | null;
}

export interface BrandRef {
  id: string;
  name: string;
}

export interface UomRef {
  id: string;
  name: string;
  symbol: string;
}

export interface SupplierRef {
  id: string;
  supplier_code: string;
  name: string;
}

export interface ProductRef {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  reorder_level: number;
  cost_price: number | null;
  selling_price: number | null;
  category?: CategoryRef | null;
  brand?: BrandRef | null;
  uom?: UomRef | null;
  supplier?: SupplierRef | null;
}

export interface UserRef {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface InventoryItem {
  id: string;
  product: ProductRef | null;
  quantity_on_hand: number;
  average_cost: number;
  stock_value: number;
  last_updated_at: string | null;
  last_transaction_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventorySummary {
  total_products: number;
  total_products_in_stock: number;
  total_out_of_stock: number;
  total_low_stock: number;
  total_quantity_on_hand: number;
  total_stock_value: number;
}

export interface InventoryValuation {
  product_id: string;
  sku: string;
  product_name: string;
  quantity_on_hand: number;
  average_cost: number;
  stock_value: number;
}

export interface InventoryValuationSummary {
  total_products: number;
  total_quantity: number;
  total_value: number;
  items: InventoryValuation[];
}

export type LedgerEntryType =
  | "PURCHASE_RECEIPT"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "STOCK_RELEASE"
  | "INITIAL_STOCK";

export type LedgerReferenceType =
  | "GRN"
  | "STOCK_ADJUSTMENT"
  | "STOCK_RELEASE"
  | "INITIAL";

export interface InventoryLedgerEntry {
  id: string;
  product: ProductRef | null;
  entry_type: LedgerEntryType | string;
  quantity_before: number;
  quantity_change: number;
  quantity_after: number;
  unit_cost: number;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  notes: string | null;
  created_by: UserRef | null;
  created_at: string;
}

// New API-aligned adjustment types
export type StockAdjustmentType = "INCREASE" | "DECREASE" | "RECOUNT";

export type StockAdjustmentStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED";

export type StockAdjustmentPeriod = "day" | "week" | "month" | "custom";

export interface StockAdjustmentItemCreate {
  product_id: string;
  quantity_adjusted: number;
  unit_cost?: number;
  notes?: string | null;
}

export interface StockAdjustmentItem {
  id: string;
  stock_adjustment_id: string;
  product: ProductRef | null;
  quantity_adjusted: number;
  unit_cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** List-view summary (no items, no audit trail) */
export interface StockAdjustmentSummary {
  id: string;
  adjustment_number: string;
  adjustment_type: StockAdjustmentType;
  status: StockAdjustmentStatus;
  reason: string;
  item_count: number;
  created_by: UserRef | null;
  created_at: string;
}

/** Full detail response (includes items + full audit trail) */
export interface StockAdjustment {
  id: string;
  adjustment_number: string;
  adjustment_type: StockAdjustmentType;
  status: StockAdjustmentStatus;
  reason: string;
  notes: string | null;
  created_by: UserRef | null;
  submitted_by: UserRef | null;
  submitted_at: string | null;
  approved_by: UserRef | null;
  approved_at: string | null;
  cancelled_by: UserRef | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  items: StockAdjustmentItem[];
  created_at: string;
  updated_at: string;
}

export interface StockAdjustmentCreatePayload {
  adjustment_type: StockAdjustmentType;
  reason: string;
  notes?: string | null;
  items: StockAdjustmentItemCreate[];
}

export interface StockAdjustmentUpdatePayload {
  adjustment_type?: StockAdjustmentType;
  reason?: string;
  notes?: string | null;
  items?: StockAdjustmentItemCreate[];
}

export interface StockAdjustmentFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: StockAdjustmentStatus | "ALL";
  adjustment_type?: StockAdjustmentType | "ALL";
  period?: StockAdjustmentPeriod | "ALL";
  from_date?: string;
  to_date?: string;
}

export interface InventoryFilterParams {
  page?: number;
  size?: number;
  search?: string;
  category_id?: string;
  brand_id?: string;
  supplier_id?: string;
  stock_status?: StockStatus | "ALL";
  low_stock_only?: boolean;
  out_of_stock_only?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export type LedgerPeriod = "day" | "week" | "month" | "custom";

export interface LedgerFilterParams {
  page?: number;
  size?: number;
  product_id?: string;
  entry_type?: string;
  reference_type?: string;
  period?: LedgerPeriod | "ALL";
  from_date?: string;
  to_date?: string;
  search?: string;
}
