"use client";

import * as React from "react";
import {
  Package,
  Truck,
  Archive,
  DollarSign,
  ShoppingCart,
  ClipboardList,
  ArrowUpFromLine,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { DashboardStats } from "../../types";

interface AdminKpiCardsProps {
  stats?: DashboardStats;
  loading?: boolean;
}

/**
 * AdminKpiCards — 8 KPI tiles for the Admin dashboard.
 */
export function AdminKpiCards({ stats, loading = false }: AdminKpiCardsProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Key performance indicators"
    >
      <StatCard
        label="Total Products"
        value={loading ? "—" : formatNumber(stats?.total_products)}
        icon={<Package className="h-5 w-5" aria-hidden="true" />}
        trend={
          stats?.trends?.products
            ? { value: stats.trends.products.value, label: "vs last month" }
            : undefined
        }
        loading={loading}
      />
      <StatCard
        label="Total Suppliers"
        value={loading ? "—" : formatNumber(stats?.total_suppliers)}
        icon={<Truck className="h-5 w-5" aria-hidden="true" />}
        trend={
          stats?.trends?.suppliers
            ? { value: stats.trends.suppliers.value, label: "vs last month" }
            : undefined
        }
        loading={loading}
      />
      <StatCard
        label="Inventory Items"
        value={loading ? "—" : formatNumber(stats?.total_inventory_items)}
        icon={<Archive className="h-5 w-5" aria-hidden="true" />}
        loading={loading}
      />
      <StatCard
        label="Inventory Value"
        value={loading ? "—" : formatCurrency(stats?.inventory_value)}
        description="Total stock value"
        icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
        trend={
          stats?.trends?.inventory_value
            ? { value: stats.trends.inventory_value.value, label: "vs last month" }
            : undefined
        }
        loading={loading}
      />
      <StatCard
        label="Pending POs"
        value={loading ? "—" : formatNumber(stats?.pending_purchase_orders)}
        description="Awaiting approval"
        icon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
        trend={
          stats?.trends?.purchase_orders
            ? { value: stats.trends.purchase_orders.value, label: "vs last month" }
            : undefined
        }
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
        label="Pending Releases"
        value={loading ? "—" : formatNumber(stats?.pending_stock_releases)}
        description="Stock releases pending"
        icon={<ArrowUpFromLine className="h-5 w-5" aria-hidden="true" />}
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
