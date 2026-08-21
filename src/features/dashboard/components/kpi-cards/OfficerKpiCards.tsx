"use client";

import * as React from "react";
import {
  Package,
  Truck,
  ShoppingCart,
  ClipboardList,
  AlertTriangle,
  PackageX,
} from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { formatNumber } from "@/utils/format";
import type { DashboardStats } from "../../types";

interface OfficerKpiCardsProps {
  stats?: Pick<DashboardStats,
    | "total_products"
    | "total_suppliers"
    | "pending_purchase_orders"
    | "pending_grns"
    | "low_stock_count"
    | "out_of_stock_count"
  >;
  loading?: boolean;
}

/**
 * OfficerKpiCards — 6 KPI tiles for the Procurement Officer dashboard.
 */
export function OfficerKpiCards({ stats, loading = false }: OfficerKpiCardsProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Key performance indicators"
    >
      <StatCard
        label="Total Products"
        value={loading ? "—" : formatNumber(stats?.total_products)}
        description="Active catalog items"
        icon={<Package className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Total Suppliers"
        value={loading ? "—" : formatNumber(stats?.total_suppliers)}
        description="Active vendors"
        icon={<Truck className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
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
        label="Low Stock Items"
        value={loading ? "—" : formatNumber(stats?.low_stock_count)}
        description="Below reorder level"
        icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Out of Stock Items"
        value={loading ? "—" : formatNumber(stats?.out_of_stock_count)}
        description="Zero quantity available"
        icon={<PackageX className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
    </div>
  );
}
