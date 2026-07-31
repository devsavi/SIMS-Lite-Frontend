"use client";

/**
 * AdminDashboard — full overview for admin / super_admin roles.
 *
 * Data is fetched in parallel using individual TanStack Query hooks.
 * The page refetches in the background and provides a manual refresh button.
 */

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import {
  useDashboardStats,
  useDashboardCharts,
  useRecentActivities,
  useDashboardNotifications,
  usePendingApprovals,
  useRecentPurchaseOrders,
  useRecentGRNs,
  useLowStockItems,
  dashboardKeys,
} from "../hooks/use-dashboard";
import { AdminKpiCards } from "../components/kpi-cards/AdminKpiCards";
import {
  InventoryValueTrendChart,
  MonthlyPurchaseOrdersChart,
  MonthlyStockReleasesChart,
  TopReleasedProductsChart,
  LowStockDistributionChart,
} from "../components/charts/DashboardCharts";
import { RecentActivitiesWidget } from "../components/widgets/RecentActivitiesWidget";
import { NotificationsWidget } from "../components/widgets/NotificationsWidget";
import { PendingApprovalsWidget } from "../components/widgets/PendingApprovalsWidget";
import { RecentPurchaseOrdersWidget } from "../components/widgets/RecentPurchaseOrdersWidget";
import { RecentGRNsWidget } from "../components/widgets/RecentGRNsWidget";
import { LowStockWidget } from "../components/widgets/LowStockWidget";
import { AdminQuickActions } from "../components/widgets/QuickActions";
import { DashboardFilters } from "../components/filters/DashboardFilters";
import type { DashboardQueryParams } from "../types";

type Period = NonNullable<DashboardQueryParams["period"]>;

export function AdminDashboard() {
  const [period, setPeriod] = React.useState<Period>("today");
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const queryClient = useQueryClient();

  const getIsoDate = (dateStr: string, timeSuffix: string) => {
    if (!dateStr) return undefined;
    try {
      return new Date(dateStr + timeSuffix).toISOString();
    } catch (e) {
      return undefined;
    }
  };

  const params: DashboardQueryParams = {
    period,
    ...(period === "custom" ? {
      from_date: getIsoDate(fromDate, "T00:00:00"),
      to_date: getIsoDate(toDate, "T23:59:59.999"),
    } : {}),
  };

  const statsQuery = useDashboardStats(params);
  const chartsQuery = useDashboardCharts(params);
  const activitiesQuery = useRecentActivities(8);
  const notificationsQuery = useDashboardNotifications(5);
  const approvalsQuery = usePendingApprovals();
  const purchaseOrdersQuery = useRecentPurchaseOrders(5);
  const grnsQuery = useRecentGRNs(5);
  const lowStockQuery = useLowStockItems(8);

  const isRefreshing =
    statsQuery.isFetching ||
    chartsQuery.isFetching ||
    activitiesQuery.isFetching;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="System overview and analytics"
        actions={
          <DashboardFilters
            period={period}
            onPeriodChange={setPeriod}
            fromDate={fromDate}
            onFromDateChange={setFromDate}
            toDate={toDate}
            onToDateChange={setToDate}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        }
      />

      {/* KPI Cards */}
      <section aria-labelledby="kpi-section-heading">
        <h2 id="kpi-section-heading" className="sr-only">
          Key Performance Indicators
        </h2>
        <AdminKpiCards
          stats={statsQuery.data}
          loading={statsQuery.isLoading}
        />
      </section>

      {/* Quick Actions */}
      <AdminQuickActions />

      {/* Charts — row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InventoryValueTrendChart
          data={chartsQuery.data?.inventory_value_trend}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
        />
        <MonthlyPurchaseOrdersChart
          data={chartsQuery.data?.monthly_purchase_orders}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
        />
      </div>

      {/* Charts — row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <MonthlyStockReleasesChart
          data={chartsQuery.data?.monthly_stock_releases}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
        />
        <TopReleasedProductsChart
          data={chartsQuery.data?.top_released_products}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
        />
        <LowStockDistributionChart
          data={chartsQuery.data?.low_stock_distribution}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
        />
      </div>

      {/* Widgets — row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PendingApprovalsWidget
          approvals={approvalsQuery.data}
          loading={approvalsQuery.isLoading}
          error={approvalsQuery.error}
          onRetry={() => approvalsQuery.refetch()}
        />
        <LowStockWidget
          items={lowStockQuery.data}
          loading={lowStockQuery.isLoading}
          error={lowStockQuery.error}
          onRetry={() => lowStockQuery.refetch()}
        />
      </div>

      {/* Widgets — row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPurchaseOrdersWidget
          orders={purchaseOrdersQuery.data}
          loading={purchaseOrdersQuery.isLoading}
          error={purchaseOrdersQuery.error}
          onRetry={() => purchaseOrdersQuery.refetch()}
        />
        <RecentGRNsWidget
          grns={grnsQuery.data}
          loading={grnsQuery.isLoading}
          error={grnsQuery.error}
          onRetry={() => grnsQuery.refetch()}
        />
      </div>

      {/* Widgets — row 3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivitiesWidget
          activities={activitiesQuery.data?.items}
          loading={activitiesQuery.isLoading}
          error={activitiesQuery.error}
          onRetry={() => activitiesQuery.refetch()}
        />
        <NotificationsWidget
          notifications={notificationsQuery.data?.items}
          unreadCount={notificationsQuery.data?.unread_count}
          loading={notificationsQuery.isLoading}
          error={notificationsQuery.error}
          onRetry={() => notificationsQuery.refetch()}
        />
      </div>
    </PageContainer>
  );
}
