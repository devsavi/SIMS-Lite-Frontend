"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  ArrowUpFromLine,
  Activity,
} from "lucide-react";
import { useSystemSettingsStore } from "@/stores/settings.store";
import { formatCurrency } from "@/utils/format";
import type { AnalyticsOverviewResponse } from "../../types";

interface ReportsKpiCardsProps {
  analytics?: AnalyticsOverviewResponse;
  isLoading?: boolean;
}

export function ReportsKpiCards({ analytics, isLoading }: ReportsKpiCardsProps) {
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);

  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-card border border-border rounded-none p-4 animate-pulse space-y-3"
          >
            <div className="h-4 w-24 bg-muted" />
            <div className="h-7 w-36 bg-muted" />
            <div className="h-3 w-28 bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const { kpis } = analytics;
  const poGrowth = kpis.procurement_spend.growth_percentage;
  const dispatchGrowth = kpis.items_dispatched.growth_percentage;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Stock Valuation */}
      <div className="bg-card border border-border p-4 rounded-none shadow-xs space-y-2 hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stock Valuation
          </span>
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formatCurrency(kpis.total_stock_value.current, baseCurrency)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span>Across {kpis.total_stock_value.items_count} catalog items</span>
        </div>
      </div>

      {/* Card 2: Low Stock & Health Alerts */}
      <div className="bg-card border border-border p-4 rounded-none shadow-xs space-y-2 hover:border-amber-500/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stock Health Alerts
          </span>
          <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {kpis.low_stock_count.current} Low
          </div>
          <span className="text-xs font-medium text-destructive">
            / {kpis.out_of_stock_count.current} Out
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Reorder triggers active
        </div>
      </div>

      {/* Card 3: Procurement Spend & Growth */}
      <div className="bg-card border border-border p-4 rounded-none shadow-xs space-y-2 hover:border-blue-500/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Procurement Spend
          </span>
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formatCurrency(kpis.procurement_spend.current, baseCurrency)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {poGrowth >= 0 ? (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> +{poGrowth}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-semibold">
              <TrendingDown className="h-3.5 w-3.5" /> {poGrowth}%
            </span>
          )}
          <span className="text-muted-foreground">vs prior period</span>
        </div>
      </div>

      {/* Card 4: Dispatched Stock Volume */}
      <div className="bg-card border border-border p-4 rounded-none shadow-xs space-y-2 hover:border-purple-500/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stock Outflows
          </span>
          <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <ArrowUpFromLine className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {kpis.items_dispatched.current.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">units</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {dispatchGrowth >= 0 ? (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> +{dispatchGrowth}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
              <TrendingDown className="h-3.5 w-3.5" /> {dispatchGrowth}%
            </span>
          )}
          <span className="text-muted-foreground">outflow delta</span>
        </div>
      </div>
    </div>
  );
}
