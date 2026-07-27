export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductRef {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  reorder_level: number;
  cost_price: number | null;
  selling_price: number | null;
  category_id?: string | null;
  category_name?: string | null;
  brand_id?: string | null;
  brand_name?: string | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  uom_name?: string | null;
  uom_code?: string | null;
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
  | "GRN_RECEIPT"
  | "STOCK_RELEASE"
  | "ADJUSTMENT_INCREASE"
  | "ADJUSTMENT_DECREASE"
  | "INITIAL_STOCK"
  | "RETURN"
  | "TRANSFER";

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

export type StockAdjustmentType = "increase" | "decrease" | "damage" | "loss" | "found" | "cycle_count" | "write_off";

export type StockAdjustmentStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED";

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

export interface LedgerFilterParams {
  page?: number;
  size?: number;
  product_id?: string;
  entry_type?: string;
  reference_type?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}
