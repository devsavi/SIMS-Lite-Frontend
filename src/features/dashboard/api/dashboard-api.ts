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
    const res = await get<SuccessResponse<DashboardStats>>(`${BASE}/stats`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Charts
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/charts
   * Returns chart datasets for the dashboard.
   */
  getCharts: async (params?: DashboardQueryParams): Promise<DashboardCharts> => {
    const res = await get<SuccessResponse<DashboardCharts>>(`${BASE}/charts`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Activities
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/activities
   * Returns recent system activity.
   */
  getActivities: async (params?: { limit?: number }): Promise<DashboardActivities> => {
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
   * Returns unread notifications for the current user.
   */
  getNotifications: async (params?: { limit?: number }): Promise<DashboardNotifications> => {
    const res = await get<SuccessResponse<DashboardNotifications>>(`${BASE}/notifications`, {
      params,
    });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Pending approvals
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/pending-approvals
   * Returns items awaiting approval by the current user.
   */
  getPendingApprovals: async (): Promise<PendingApproval[]> => {
    const res = await get<SuccessResponse<PendingApproval[]>>(`${BASE}/pending-approvals`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Purchase orders
  // ---------------------------------------------------------------------------

  /**
   * GET /dashboard/recent-purchase-orders
   * Returns recently created purchase orders.
   */
  getRecentPurchaseOrders: async (params?: { limit?: number }): Promise<RecentPurchaseOrder[]> => {
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
   */
  getRecentGRNs: async (params?: { limit?: number }): Promise<RecentGRN[]> => {
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
   * Returns products at or below reorder level.
   */
  getLowStockItems: async (params?: { limit?: number }): Promise<LowStockItem[]> => {
    const res = await get<SuccessResponse<LowStockItem[]>>(`${BASE}/low-stock`, {
      params,
    });
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
