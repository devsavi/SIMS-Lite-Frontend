"use client";

import * as React from "react";
import { Package, CheckCircle, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { formatCurrency, formatQuantity } from "../../utils/inventory-utils";
import type { InventorySummary } from "../../types";

export interface InventorySummaryCardsProps {
  summary?: InventorySummary | null;
  loading?: boolean;
}

export function InventorySummaryCards({ summary, loading }: InventorySummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Products"
        value={loading || !summary ? "—" : formatQuantity(summary.total_products)}
        description="Active product records"
        icon={<Package className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <StatCard
        label="In Stock"
        value={loading || !summary ? "—" : formatQuantity(summary.total_products_in_stock)}
        description="Healthy stock levels"
        icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        loading={loading}
      />
      <StatCard
        label="Low Stock Alert"
        value={loading || !summary ? "—" : formatQuantity(summary.total_low_stock)}
        description="At or below reorder point"
        icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        loading={loading}
      />
      <StatCard
        label="Out of Stock"
        value={loading || !summary ? "—" : formatQuantity(summary.total_out_of_stock)}
        description="Zero quantity on hand"
        icon={<XCircle className="h-5 w-5 text-rose-600" />}
        loading={loading}
      />
      <StatCard
        label="Total Valuation"
        value={loading || !summary ? "—" : formatCurrency(summary.total_stock_value)}
        description="Combined inventory value"
        icon={<DollarSign className="h-5 w-5 text-blue-600" />}
        loading={loading}
      />
    </div>
  );
}
