"use client";

import * as React from "react";
import {
  ShoppingCart,
  ClipboardList,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { DashboardStats } from "../../types";

interface OfficerKpiCardsProps {
  stats?: Pick<DashboardStats,
    | "pending_purchase_orders"
    | "pending_grns"
    | "inventory_value"
    | "low_stock_count"
  >;
  loading?: boolean;
}

/**
 * OfficerKpiCards — 4 KPI tiles for the Procurement Officer dashboard.
 */
export function OfficerKpiCards({ stats, loading = false }: OfficerKpiCardsProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Key performance indicators"
    >
      <StatCard
        label="Pending POs"
        value={loading ? "—" : formatNumber(stats?.pending_purchase_orders)}
        description="Awaiting approval"
        icon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Pending GRNs"
        value={loading ? "—" : formatNumber(stats?.pending_grns)}
        description="Awaiting verification"
        icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Inventory Value"
        value={loading ? "—" : formatCurrency(stats?.inventory_value)}
        description="Total stock value"
        icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Low Stock Items"
        value={loading ? "—" : formatNumber(stats?.low_stock_count)}
        description="Below reorder level"
        icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
    </div>
  );
}
