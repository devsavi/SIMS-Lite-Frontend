/**
 * Dashboard feature — API calls
 * All paths relative to NEXT_PUBLIC_API_URL (e.g. http://localhost:8001/api/v1)
 *
 * Backend wraps every 2xx response in { status: "success", data: ... }.
 * These helpers unwrap the envelope and return the inner `data` directly.
 */

import { get } from "@/lib/api/client";
import type { SuccessResponse } from "@/features/auth/types";
import type {
  DashboardStats,
  DashboardCharts,
  DashboardActivities,
  DashboardNotifications,
  NotificationItem,
  PendingApproval,
  RecentPurchaseOrder,
  RecentGRN,
  LowStockItem,
  InventoryAlert,
  InventoryAdjustment,
  PendingStockRelease,
  AdminDashboardData,
  OfficerDashboardData,
  StoreKeeperDashboardData,
  DashboardQueryParams,
  ChartQueryParams,
} from "../types";

const BASE = "/dashboard";

export const dashboardApi = {
  // ---------------------------------------------------------------------------
  // Overview — full admin dashboard bundle (or role-filtered by backend)
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/overview
   * Returns the full dashboard data bundle (role-aware on the backend).
   */
  getOverview: async (params?: DashboardQueryParams): Promise<AdminDashboardData> => {
    const res = await get<SuccessResponse<AdminDashboardData>>(`${BASE}/overview`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/stats
   * Returns KPI statistics.
   */
  getStats: async (params?: DashboardQueryParams): Promise<DashboardStats> => {
    const res = await get<SuccessResponse<any>>(`${BASE}/stats`, {
      params,
    });
    const raw = res.data;
    return {
      total_products: raw.master_data?.total_products ?? 0,
      total_suppliers: raw.master_data?.total_suppliers ?? 0,
      inventory_value: raw.inventory?.total_inventory_value ?? 0,
      low_stock_count: raw.inventory?.low_stock_items ?? 0,
      out_of_stock_count: raw.inventory?.total_out_of_stock ?? 0,
      pending_purchase_orders: raw.procurement?.pending_pos ?? 0,
      pending_grns: raw.procurement?.pending_grns ?? 0,
      pending_stock_releases: raw.stock_releases?.pending_releases ?? 0,
      today_stock_releases: raw.stock_releases?.approved_releases ?? 0,
    };
  },

  // ---------------------------------------------------------------------------
  // Charts
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/charts
   * Returns chart datasets for the dashboard.
   * @param params.year - Year to filter data (> 2000 and ≤ current year). Defaults to current year.
   */
  getCharts: async (params?: ChartQueryParams): Promise<DashboardCharts> => {
    const currentYear = new Date().getFullYear();
    const year = params?.year ?? currentYear;
    const res = await get<SuccessResponse<DashboardCharts>>(`${BASE}/charts`, {
      params: { year },
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Activities
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/activities
   * Returns recent system activity.
   * Supports the same period / from_date / to_date filters as the stats section.
   */
  getActivities: async (params?: DashboardQueryParams): Promise<DashboardActivities> => {
    const res = await get<SuccessResponse<DashboardActivities>>(`${BASE}/activities`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/notifications
   * Returns notifications for the current user.
   * Supports the same period / from_date / to_date filters as the stats section.
   * Response: { status, data: NotificationItem[], pagination: { ... } }
   */
  getNotifications: async (params?: DashboardQueryParams): Promise<DashboardNotifications> => {
    const res = await get<{ status: string; data: NotificationItem[]; pagination: { page: number; size: number; total: number; pages: number } }>(`${BASE}/notifications`, {
      params,
    });
    const unread_count = res.data.filter((n) => !n.is_read).length;
    return {
      items: res.data,
      unread_count,
      pagination: res.pagination,
    };
  },

  // ---------------------------------------------------------------------------
  // Pending approvals
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/pending-approvals
   * Returns items awaiting approval by the current user.
   * Supports the same period / from_date / to_date filters as the stats section.
   */
  getPendingApprovals: async (params?: DashboardQueryParams): Promise<PendingApproval[]> => {
    const res = await get<SuccessResponse<PendingApproval[]>>(`${BASE}/pending-approvals`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Purchase orders
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/recent-purchase-orders
   * Returns recently created purchase orders.
   * Supports the same period / from_date / to_date filters as the stats section.
   */
  getRecentPurchaseOrders: async (params?: DashboardQueryParams & { limit?: number }): Promise<RecentPurchaseOrder[]> => {
    const res = await get<SuccessResponse<RecentPurchaseOrder[]>>(`${BASE}/recent-purchase-orders`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // GRNs
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/recent-grns
   * Returns recently received goods.
   * Supports the same period / from_date / to_date filters as the stats section.
   */
  getRecentGRNs: async (params?: DashboardQueryParams & { limit?: number }): Promise<RecentGRN[]> => {
    const res = await get<SuccessResponse<RecentGRN[]>>(`${BASE}/recent-grns`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Low stock
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/low-stock
   * Returns all products at or below reorder level (no limit param — backend returns all).
   */
  getLowStockItems: async (): Promise<LowStockItem[]> => {
    const res = await get<SuccessResponse<LowStockItem[]>>(`${BASE}/low-stock`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Inventory alerts
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/inventory-alerts
   * Returns active inventory alerts for store keepers.
   */
  getInventoryAlerts: async (): Promise<InventoryAlert[]> => {
    const res = await get<SuccessResponse<InventoryAlert[]>>(`${BASE}/inventory-alerts`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Recent adjustments
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/recent-adjustments
   * Returns recent inventory adjustments.
   */
  getRecentAdjustments: async (params?: { limit?: number }): Promise<InventoryAdjustment[]> => {
    const res = await get<SuccessResponse<InventoryAdjustment[]>>(`${BASE}/recent-adjustments`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Pending stock releases
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/pending-stock-releases
   * Returns pending stock release requests.
   */
  getPendingStockReleases: async (): Promise<PendingStockRelease[]> => {
    const res = await get<SuccessResponse<PendingStockRelease[]>>(`${BASE}/pending-stock-releases`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Role-specific bundles (optional — backend may provide these shortcuts)
  // ---------------------------------------------------------------------------

  getOfficerDashboard: async (params?: DashboardQueryParams): Promise<OfficerDashboardData> => {
    const res = await get<SuccessResponse<OfficerDashboardData>>(`${BASE}/officer`, { params });
    return res.data;
  },

  getStoreKeeperDashboard: async (params?: DashboardQueryParams): Promise<StoreKeeperDashboardData> => {
    const res = await get<SuccessResponse<StoreKeeperDashboardData>>(`${BASE}/store-keeper`, { params });
    return res.data;
  },
};
