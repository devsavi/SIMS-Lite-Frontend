"use client";

import * as React from "react";
import {
  Archive,
  AlertTriangle,
  ArrowUpFromLine,
} from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { formatNumber } from "@/utils/format";
import type { DashboardStats } from "../../types";

interface StoreKeeperKpiCardsProps {
  stats?: Pick<DashboardStats,
    | "total_inventory_items"
    | "low_stock_count"
    | "today_stock_releases"
  >;
  loading?: boolean;
}

/**
 * StoreKeeperKpiCards — 3 KPI tiles for the Store Keeper dashboard.
 */
export function StoreKeeperKpiCards({ stats, loading = false }: StoreKeeperKpiCardsProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      aria-label="Key performance indicators"
    >
      <StatCard
        label="Current Inventory"
        value={loading ? "—" : formatNumber(stats?.total_inventory_items)}
        description="Total inventory items"
        icon={<Archive className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Low Stock Products"
        value={loading ? "—" : formatNumber(stats?.low_stock_count)}
        description="Below reorder level"
        icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Today's Releases"
        value={loading ? "—" : formatNumber(stats?.today_stock_releases)}
        description="Stock releases today"
        icon={<ArrowUpFromLine className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
    </div>
  );
}
