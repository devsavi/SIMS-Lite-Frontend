/**
 * Dashboard feature — TanStack Query hooks
 *
 * All hooks use a consistent staleTime / refetchInterval for the dashboard.
 * The overview hook fetches everything in one call; individual hooks
 * allow granular refreshes and lazy loading.
 */

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard-api";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import type { DashboardQueryParams, ChartQueryParams } from "../types";

// ---------------------------------------------------------------------------
// Query keys (stable references for invalidation)
// ---------------------------------------------------------------------------

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (params?: DashboardQueryParams) =>
    [...dashboardKeys.all, "overview", params] as const,
  stats: (params?: DashboardQueryParams) =>
    [...dashboardKeys.all, "stats", params] as const,
  charts: (params?: ChartQueryParams) =>
    [...dashboardKeys.all, "charts", params] as const,
  activities: (params?: DashboardQueryParams | number) =>
    [...dashboardKeys.all, "activities", params] as const,
  notifications: (params?: DashboardQueryParams) =>
    [...dashboardKeys.all, "notifications", params] as const,
  pendingApprovals: (params?: DashboardQueryParams) =>
    [...dashboardKeys.all, "pending-approvals", params] as const,
  recentPurchaseOrders: (params?: DashboardQueryParams & { limit?: number }) =>
    [...dashboardKeys.all, "recent-purchase-orders", params] as const,
  recentGRNs: (params?: DashboardQueryParams & { limit?: number }) =>
    [...dashboardKeys.all, "recent-grns", params] as const,
  lowStock: () => [...dashboardKeys.all, "low-stock"] as const,
  inventoryAlerts: () => [...dashboardKeys.all, "inventory-alerts"] as const,
  recentAdjustments: (limit?: number) =>
    [...dashboardKeys.all, "recent-adjustments", limit] as const,
  pendingStockReleases: () =>
    [...dashboardKeys.all, "pending-stock-releases"] as const,
  officerDashboard: (params?: DashboardQueryParams) =>
    [...dashboardKeys.all, "officer", params] as const,
  storeKeeperDashboard: (params?: DashboardQueryParams) =>
    [...dashboardKeys.all, "store-keeper", params] as const,
};

// ---------------------------------------------------------------------------
// Shared config
// ---------------------------------------------------------------------------

const DASHBOARD_STALE_TIME = QUERY_CACHE_TIMES.DASHBOARD.staleTime;
const DASHBOARD_GC_TIME = QUERY_CACHE_TIMES.DASHBOARD.gcTime;
const DASHBOARD_REFETCH_INTERVAL = 1000 * 60 * 5; // background refetch every 5 min

// ---------------------------------------------------------------------------
// useDashboard — full admin overview bundle
// ---------------------------------------------------------------------------

export function useDashboard(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.overview(params),
    queryFn: () => dashboardApi.getOverview(params),
    staleTime: DASHBOARD_STALE_TIME,
    gcTime: DASHBOARD_GC_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// useDashboardStats — KPI numbers
// ---------------------------------------------------------------------------

export function useDashboardStats(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.stats(params),
    queryFn: () => dashboardApi.getStats(params),
    staleTime: DASHBOARD_STALE_TIME,
    gcTime: DASHBOARD_GC_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// useDashboardCharts — chart data
// ---------------------------------------------------------------------------

export function useDashboardCharts(params?: ChartQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.charts(params),
    queryFn: () => dashboardApi.getCharts(params),
    staleTime: DASHBOARD_STALE_TIME,
    gcTime: DASHBOARD_GC_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useRecentActivities
// ---------------------------------------------------------------------------

export function useRecentActivities(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.activities(params),
    queryFn: () => dashboardApi.getActivities(params),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useDashboardNotifications
// ---------------------------------------------------------------------------

export function useDashboardNotifications(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.notifications(params),
    queryFn: () => dashboardApi.getNotifications(params),
    staleTime: 1000 * 60, // 1 minute — notifications should refresh quickly
    refetchInterval: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// usePendingApprovals
// ---------------------------------------------------------------------------

export function usePendingApprovals(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.pendingApprovals(params),
    queryFn: () => dashboardApi.getPendingApprovals(params),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useRecentPurchaseOrders
// ---------------------------------------------------------------------------

export function useRecentPurchaseOrders(limit = 5, params?: DashboardQueryParams) {
  const queryParams = { ...params, limit };
  return useQuery({
    queryKey: dashboardKeys.recentPurchaseOrders(queryParams),
    queryFn: () => dashboardApi.getRecentPurchaseOrders(queryParams),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useRecentGRNs
// ---------------------------------------------------------------------------

export function useRecentGRNs(limit = 5, params?: DashboardQueryParams) {
  const queryParams = { ...params, limit };
  return useQuery({
    queryKey: dashboardKeys.recentGRNs(queryParams),
    queryFn: () => dashboardApi.getRecentGRNs(queryParams),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useLowStockItems
// ---------------------------------------------------------------------------

export function useLowStockItems() {
  return useQuery({
    queryKey: dashboardKeys.lowStock(),
    queryFn: () => dashboardApi.getLowStockItems(),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useInventoryAlerts
// ---------------------------------------------------------------------------

export function useInventoryAlerts() {
  return useQuery({
    queryKey: dashboardKeys.inventoryAlerts(),
    queryFn: dashboardApi.getInventoryAlerts,
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useRecentAdjustments
// ---------------------------------------------------------------------------

export function useRecentAdjustments(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.recentAdjustments(limit),
    queryFn: () => dashboardApi.getRecentAdjustments({ limit }),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// usePendingStockReleases
// ---------------------------------------------------------------------------

export function usePendingStockReleases() {
  return useQuery({
    queryKey: dashboardKeys.pendingStockReleases(),
    queryFn: dashboardApi.getPendingStockReleases,
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

// ---------------------------------------------------------------------------
// useOfficerDashboard — officer-scoped bundle
// ---------------------------------------------------------------------------

export function useOfficerDashboard(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.officerDashboard(params),
    queryFn: () => dashboardApi.getOfficerDashboard(params),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// useStoreKeeperDashboard — store keeper bundle
// ---------------------------------------------------------------------------

export function useStoreKeeperDashboard(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: dashboardKeys.storeKeeperDashboard(params),
    queryFn: () => dashboardApi.getStoreKeeperDashboard(params),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}
