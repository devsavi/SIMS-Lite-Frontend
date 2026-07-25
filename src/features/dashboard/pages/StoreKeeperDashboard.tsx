"use client";

/**
 * StoreKeeperDashboard — stock_clerk / warehouse_manager view.
 */

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import {
  useDashboardStats,
  useDashboardNotifications,
  useInventoryAlerts,
  usePendingStockReleases,
  useRecentAdjustments,
  dashboardKeys,
} from "../hooks/use-dashboard";
import { StoreKeeperKpiCards } from "../components/kpi-cards/StoreKeeperKpiCards";
import { InventoryAlertsWidget } from "../components/widgets/InventoryAlertsWidget";
import { PendingStockReleasesWidget } from "../components/widgets/PendingStockReleasesWidget";
import { RecentAdjustmentsWidget } from "../components/widgets/RecentAdjustmentsWidget";
import { NotificationsWidget } from "../components/widgets/NotificationsWidget";
import { StoreKeeperQuickActions } from "../components/widgets/QuickActions";
import { DashboardFilters } from "../components/filters/DashboardFilters";
import type { DashboardQueryParams } from "../types";

type Period = NonNullable<DashboardQueryParams["period"]>;

export function StoreKeeperDashboard() {
  const [period, setPeriod] = React.useState<Period>("30d");
  const queryClient = useQueryClient();

  const params: DashboardQueryParams = { period };

  const statsQuery = useDashboardStats(params);
  const notificationsQuery = useDashboardNotifications(5);
  const alertsQuery = useInventoryAlerts();
  const stockReleasesQuery = usePendingStockReleases();
  const adjustmentsQuery = useRecentAdjustments(6);

  const isRefreshing = statsQuery.isFetching || alertsQuery.isFetching;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Warehouse and inventory overview"
        actions={
          <DashboardFilters
            period={period}
            onPeriodChange={setPeriod}
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
        <StoreKeeperKpiCards
          stats={statsQuery.data}
          loading={statsQuery.isLoading}
        />
      </section>

      {/* Quick Actions */}
      <StoreKeeperQuickActions />

      {/* Alerts + Releases */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InventoryAlertsWidget
          alerts={alertsQuery.data}
          loading={alertsQuery.isLoading}
          error={alertsQuery.error}
          onRetry={() => alertsQuery.refetch()}
        />
        <PendingStockReleasesWidget
          releases={stockReleasesQuery.data}
          loading={stockReleasesQuery.isLoading}
          error={stockReleasesQuery.error}
          onRetry={() => stockReleasesQuery.refetch()}
        />
      </div>

      {/* Adjustments + Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentAdjustmentsWidget
          adjustments={adjustmentsQuery.data}
          loading={adjustmentsQuery.isLoading}
          error={adjustmentsQuery.error}
          onRetry={() => adjustmentsQuery.refetch()}
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
