"use client";

/**
 * OfficerDashboard — procurement officer / warehouse manager view.
 */

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import {
  useDashboardStats,
  useDashboardCharts,
  useDashboardNotifications,
  useRecentPurchaseOrders,
  useRecentGRNs,
  dashboardKeys,
} from "../hooks/use-dashboard";
import { OfficerKpiCards } from "../components/kpi-cards/OfficerKpiCards";
import {
  MonthlyPurchaseOrdersChart,
  GrnTrendChart,
} from "../components/charts/DashboardCharts";
import { RecentPurchaseOrdersWidget } from "../components/widgets/RecentPurchaseOrdersWidget";
import { RecentGRNsWidget } from "../components/widgets/RecentGRNsWidget";
import { NotificationsWidget } from "../components/widgets/NotificationsWidget";
import { OfficerQuickActions } from "../components/widgets/QuickActions";
import { DashboardFilters } from "../components/filters/DashboardFilters";
import type { DashboardQueryParams } from "../types";

type Period = NonNullable<DashboardQueryParams["period"]>;

export function OfficerDashboard() {
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
  const notificationsQuery = useDashboardNotifications(params);
  const purchaseOrdersQuery = useRecentPurchaseOrders(8, params);
  const grnsQuery = useRecentGRNs(5, params);

  const isRefreshing =
    statsQuery.isFetching || chartsQuery.isFetching;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Procurement and receiving overview"
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
        <OfficerKpiCards
          stats={statsQuery.data}
          loading={statsQuery.isLoading}
        />
      </section>

      {/* Quick Actions */}
      <OfficerQuickActions />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyPurchaseOrdersChart
          data={chartsQuery.data?.monthly_purchase_orders}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
        />
        <GrnTrendChart
          data={chartsQuery.data?.monthly_stock_releases}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
        />
      </div>

      {/* Purchase Orders + GRNs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPurchaseOrdersWidget
          orders={purchaseOrdersQuery.data}
          loading={purchaseOrdersQuery.isLoading}
          error={purchaseOrdersQuery.error}
          onRetry={() => purchaseOrdersQuery.refetch()}
          title="My Purchase Orders"
        />
        <RecentGRNsWidget
          grns={grnsQuery.data}
          loading={grnsQuery.isLoading}
          error={grnsQuery.error}
          onRetry={() => grnsQuery.refetch()}
          title="Pending GRNs"
        />
      </div>

      {/* Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NotificationsWidget
          notifications={notificationsQuery.data?.items}
          unreadCount={notificationsQuery.data?.unread_count}
          total={notificationsQuery.data?.pagination?.total}
          loading={notificationsQuery.isLoading}
          error={notificationsQuery.error}
          onRetry={() => notificationsQuery.refetch()}
        />
      </div>
    </PageContainer>
  );
}
