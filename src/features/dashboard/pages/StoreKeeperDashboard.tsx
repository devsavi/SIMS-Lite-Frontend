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
  useDashboardCharts,
  usePendingApprovals,
  useRecentGRNs,
  dashboardKeys,
} from "../hooks/use-dashboard";
import { StoreKeeperKpiCards } from "../components/kpi-cards/StoreKeeperKpiCards";
import {
  MonthlyStockReleasesChart,
  TopReleasedProductsChart,
  LowStockDistributionChart,
} from "../components/charts/DashboardCharts";
import { PendingApprovalsWidget } from "../components/widgets/PendingApprovalsWidget";
import { RecentGRNsWidget } from "../components/widgets/RecentGRNsWidget";
import { StoreKeeperQuickActions } from "../components/widgets/QuickActions";
import { DashboardFilters } from "../components/filters/DashboardFilters";
import type { DashboardQueryParams } from "../types";

type Period = NonNullable<DashboardQueryParams["period"]>;

export function StoreKeeperDashboard() {
  const [period, setPeriod] = React.useState<Period>("today");
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const [chartYear, setChartYear] = React.useState<number>(new Date().getFullYear());
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
  const chartsQuery = useDashboardCharts({ year: chartYear });
  const approvalsQuery = usePendingApprovals(params);
  const grnsQuery = useRecentGRNs(5, params);

  const isRefreshing = statsQuery.isFetching || chartsQuery.isFetching || approvalsQuery.isFetching;

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
        <StoreKeeperKpiCards
          stats={statsQuery.data}
          loading={statsQuery.isLoading}
        />
      </section>

      {/* Quick Actions */}
      <StoreKeeperQuickActions />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <MonthlyStockReleasesChart
          data={chartsQuery.data?.monthly_stock_releases}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
          year={chartYear}
          onYearChange={setChartYear}
        />
        <TopReleasedProductsChart
          data={chartsQuery.data?.top_released_products}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
          year={chartYear}
          onYearChange={setChartYear}
        />
        <LowStockDistributionChart
          data={chartsQuery.data?.low_stock_distribution}
          loading={chartsQuery.isLoading}
          error={chartsQuery.error}
          onRetry={() => chartsQuery.refetch()}
          year={chartYear}
          onYearChange={setChartYear}
        />
      </div>

      {/* Pending Approvals + Recent GRNs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PendingApprovalsWidget
          approvals={approvalsQuery.data}
          loading={approvalsQuery.isLoading}
          error={approvalsQuery.error}
          onRetry={() => approvalsQuery.refetch()}
          allowedTypes={["grn", "stock_release"]}
        />
        <RecentGRNsWidget
          grns={grnsQuery.data}
          loading={grnsQuery.isLoading}
          error={grnsQuery.error}
          onRetry={() => grnsQuery.refetch()}
        />
      </div>
    </PageContainer>
  );
}
