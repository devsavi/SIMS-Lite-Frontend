// ---------------------------------------------------------------------------
// PO Status & Email Status
// ---------------------------------------------------------------------------

export type POStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "PARTIALLY_RECEIVED"
  | "FULLY_RECEIVED";

export type POPeriod = "day" | "week" | "month" | "custom";

// ---------------------------------------------------------------------------
// Nested resource shapes (matching API responses)
// ---------------------------------------------------------------------------

export interface POSupplier {
  id: string;
  supplier_code: string;
  name: string;
  email: string;
  contact_person: string;
  address?: string;
}

export interface POUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface POProduct {
  id: string;
  sku: string;
  name: string;
  barcode?: string;
}

// ---------------------------------------------------------------------------
// PO Line Item (list view & detail view)
// ---------------------------------------------------------------------------

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product: POProduct;
  quantity_ordered: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
  line_total: number;
  quantity_received: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// PO List Item (returned from GET /purchase-orders)
// ---------------------------------------------------------------------------

export interface PurchaseOrderListItem {
  id: string;
  po_number: string;
  supplier: POSupplier;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string;
  total_amount: number;
  item_count: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// PO Detail (returned from GET /purchase-orders/{po_id})
// ---------------------------------------------------------------------------

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: POSupplier;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string | null;
  terms_conditions?: string | null;
  shipping_address?: string | null;
  created_by: POUser;
  submitted_by?: POUser | null;
  submitted_at?: string | null;
  approved_by?: POUser | null;
  approved_at?: string | null;
  rejected_by?: POUser | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  cancelled_by?: POUser | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  email_sent_at?: string | null;
  email_sent_to?: string | null;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// PO Print Data (returned from GET /purchase-orders/{po_id}/print)
// ---------------------------------------------------------------------------

export interface POPrintItem {
  product_name: string;
  sku: string;
  quantity_ordered: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
  line_total: number;
}

export interface POPrintData {
  po_number: string;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string;
  supplier: {
    id: string;
    name: string;
    email: string;
    contact_person: string;
    address: string;
  };
  items: POPrintItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes?: string | null;
  terms_conditions?: string | null;
  shipping_address?: string | null;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface POFilters {
  search?: string;
  status?: POStatus | "ALL";
  supplier_id?: string | "ALL";
  period?: POPeriod;
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

export interface PaginatedPOsResponse {
  status: string;
  data: PurchaseOrderListItem[];
  pagination: PaginationMeta;
}

export interface PODetailResponse {
  status: string;
  data: PurchaseOrder;
}

export interface POPrintResponse {
  status: string;
  data: POPrintData;
}

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

export interface POItemRequest {
  product_id: string;
  quantity_ordered: number;
  unit_price: number;
  discount_percent?: number;
  tax_percent?: number;
  notes?: string;
}

export interface CreatePORequest {
  supplier_id: string;
  order_date: string;
  expected_delivery_date: string;
  notes?: string;
  terms_conditions?: string;
  shipping_address?: string;
  items: POItemRequest[];
}

export interface UpdatePORequest {
  supplier_id?: string;
  order_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  terms_conditions?: string;
  shipping_address?: string;
  items?: POItemRequest[];
}

export interface RejectPORequest {
  reason: string;
}

export interface CancelPORequest {
  reason: string;
}

export interface EmailPORequest {
  to_email: string;
  message?: string;
}
