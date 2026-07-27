"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { getStockStatus, getStockStatusLabel } from "../../utils/inventory-utils";
import type { StockStatus } from "../../types";

export interface StockStatusBadgeProps {
  status?: StockStatus;
  quantityOnHand?: number;
  reorderLevel?: number;
  className?: string;
  showIcon?: boolean;
}

export function StockStatusBadge({
  status: statusProp,
  quantityOnHand,
  reorderLevel = 0,
  className,
  showIcon = true,
}: StockStatusBadgeProps) {
  const status: StockStatus =
    statusProp ?? getStockStatus(quantityOnHand ?? 0, reorderLevel);

  const label = getStockStatusLabel(status);

  let variant: "in-stock" | "low-stock" | "out-of-stock" = "in-stock";
  let Icon = CheckCircle2;

  if (status === "low_stock") {
    variant = "low-stock";
    Icon = AlertTriangle;
  } else if (status === "out_of_stock") {
    variant = "out-of-stock";
    Icon = XCircle;
  }

  return (
    <span
      aria-label={`Stock status: ${label}`}
      className={`inline-flex items-center gap-1 ${className ?? ""}`}
    >
      <StatusBadge variant={variant} label={label} className={className} />
      {showIcon && (
        <Icon
          className={`h-3.5 w-3.5 shrink-0 ${
            status === "in_stock"
              ? "text-emerald-600"
              : status === "low_stock"
              ? "text-amber-600"
              : "text-rose-600"
          }`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
