/**
 * Dashboard feature — public API
 *
 * Import from this barrel when using dashboard components outside the feature:
 *   import { DashboardRouter } from "@/features/dashboard"
 */

// Pages
export { DashboardRouter } from "./pages/DashboardRouter";
export { AdminDashboard } from "./pages/AdminDashboard";
export { OfficerDashboard } from "./pages/OfficerDashboard";
export { StoreKeeperDashboard } from "./pages/StoreKeeperDashboard";

// Hooks
export {
  useDashboard,
  useDashboardStats,
  useDashboardCharts,
  useRecentActivities,
  useDashboardNotifications,
  usePendingApprovals,
  useRecentPurchaseOrders,
  useRecentGRNs,
  useLowStockItems,
  useInventoryAlerts,
  useRecentAdjustments,
  usePendingStockReleases,
  useOfficerDashboard,
  useStoreKeeperDashboard,
  dashboardKeys,
} from "./hooks/use-dashboard";

// API
export { dashboardApi } from "./api/dashboard-api";

// Types
export type {
  DashboardStats,
  DashboardCharts,
  DashboardActivities,
  DashboardNotifications,
  AdminDashboardData,
  OfficerDashboardData,
  StoreKeeperDashboardData,
  ActivityItem,
  NotificationItem,
  PendingApproval,
  RecentPurchaseOrder,
  RecentGRN,
  LowStockItem,
  InventoryAlert,
  InventoryAdjustment,
  PendingStockRelease,
  DashboardQueryParams,
} from "./types";
