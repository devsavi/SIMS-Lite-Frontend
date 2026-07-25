/**
 * Dashboard feature — TypeScript types
 * Aligned with backend Dashboard & Analytics API responses.
 */

import type { SuccessResponse } from "@/features/auth/types";

// Re-export for convenience
export type { SuccessResponse };

// ---------------------------------------------------------------------------
// Shared / util
// ---------------------------------------------------------------------------

export interface TrendData {
  value: number;   // percentage change
  direction: "up" | "down" | "neutral";
}

// ---------------------------------------------------------------------------
// KPI Stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  // Products / Inventory
  total_products: number;
  total_suppliers: number;
  total_inventory_items: number;
  inventory_value: number;
  low_stock_count: number;

  // Procurement
  pending_purchase_orders: number;
  pending_grns: number;

  // Stock
  pending_stock_releases: number;
  today_stock_releases: number;

  // Trends (optional — backend may omit)
  trends?: {
    products?: TrendData;
    suppliers?: TrendData;
    inventory_value?: TrendData;
    purchase_orders?: TrendData;
  };
}

// ---------------------------------------------------------------------------
// Chart data
// ---------------------------------------------------------------------------

export interface MonthlyDataPoint {
  month: string;   // e.g. "Jan", "Feb"
  value: number;
  secondary?: number;
}

export interface InventoryValueTrend {
  data: MonthlyDataPoint[];
}

export interface MonthlyPurchaseOrders {
  data: MonthlyDataPoint[];
}

export interface MonthlyStockReleases {
  data: MonthlyDataPoint[];
}

export interface TopReleasedProduct {
  product_name: string;
  quantity: number;
  product_code?: string;
}

export interface LowStockCategory {
  name: string;
  count: number;
}

export interface DashboardCharts {
  inventory_value_trend: MonthlyDataPoint[];
  monthly_purchase_orders: MonthlyDataPoint[];
  monthly_stock_releases: MonthlyDataPoint[];
  top_released_products: TopReleasedProduct[];
  low_stock_distribution: LowStockCategory[];
}

// ---------------------------------------------------------------------------
// Activity / notifications
// ---------------------------------------------------------------------------

export interface ActivityItem {
  id: string;
  type: "purchase_order" | "grn" | "stock_release" | "inventory_adjustment" | "user" | "product";
  action: string;       // e.g. "created", "approved", "rejected"
  description: string;
  user_name: string;
  created_at: string;
  reference?: string;   // e.g. PO number
}

export interface NotificationItem {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export interface DashboardActivities {
  items: ActivityItem[];
  total: number;
}

export interface DashboardNotifications {
  items: NotificationItem[];
  unread_count: number;
}

// ---------------------------------------------------------------------------
// Pending approvals
// ---------------------------------------------------------------------------

export type ApprovalType = "purchase_order" | "stock_release";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface PendingApproval {
  id: string;
  type: ApprovalType;
  reference: string;     // PO number or SR number
  description: string;
  requested_by: string;
  requested_at: string;
  amount?: number;
}

// ---------------------------------------------------------------------------
// Recent Purchase Orders
// ---------------------------------------------------------------------------

export interface RecentPurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  status: "draft" | "pending" | "approved" | "partially_received" | "received" | "cancelled";
  total_amount: number;
  created_at: string;
  expected_delivery?: string;
}

// ---------------------------------------------------------------------------
// Recent GRNs
// ---------------------------------------------------------------------------

export interface RecentGRN {
  id: string;
  grn_number: string;
  po_number: string;
  supplier_name: string;
  status: "draft" | "pending" | "verified" | "rejected";
  received_at: string;
}

// ---------------------------------------------------------------------------
// Low stock alerts
// ---------------------------------------------------------------------------

export interface LowStockItem {
  id: string;
  product_name: string;
  product_code: string;
  current_quantity: number;
  reorder_level: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// Inventory alerts
// ---------------------------------------------------------------------------

export interface InventoryAlert {
  id: string;
  type: "low_stock" | "out_of_stock" | "expiring_soon" | "overstock";
  product_name: string;
  product_code: string;
  message: string;
  severity: "low" | "medium" | "high";
  created_at: string;
}

// ---------------------------------------------------------------------------
// Recent inventory adjustments
// ---------------------------------------------------------------------------

export interface InventoryAdjustment {
  id: string;
  product_name: string;
  product_code: string;
  adjustment_type: "increase" | "decrease";
  quantity: number;
  reason: string;
  adjusted_by: string;
  adjusted_at: string;
}

// ---------------------------------------------------------------------------
// Pending stock releases
// ---------------------------------------------------------------------------

export interface PendingStockRelease {
  id: string;
  release_number: string;
  requested_by: string;
  items_count: number;
  status: "pending" | "approved" | "processing" | "released";
  requested_at: string;
}

// ---------------------------------------------------------------------------
// Full dashboard response shapes
// ---------------------------------------------------------------------------

export interface AdminDashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  activities: DashboardActivities;
  notifications: DashboardNotifications;
  pending_approvals: PendingApproval[];
  recent_purchase_orders: RecentPurchaseOrder[];
  recent_grns: RecentGRN[];
}

export interface OfficerDashboardData {
  stats: Pick<DashboardStats,
    | "pending_purchase_orders"
    | "pending_grns"
    | "inventory_value"
    | "low_stock_count"
  >;
  charts: Pick<DashboardCharts,
    | "monthly_purchase_orders"
    | "monthly_stock_releases"
  >;
  assigned_purchase_orders: RecentPurchaseOrder[];
  pending_grns: RecentGRN[];
  notifications: DashboardNotifications;
}

export interface StoreKeeperDashboardData {
  stats: Pick<DashboardStats,
    | "total_inventory_items"
    | "low_stock_count"
    | "today_stock_releases"
  >;
  inventory_alerts: InventoryAlert[];
  pending_stock_releases: PendingStockRelease[];
  recent_adjustments: InventoryAdjustment[];
  notifications: DashboardNotifications;
}

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export interface DashboardQueryParams {
  period?: "7d" | "30d" | "90d" | "1y";
}
