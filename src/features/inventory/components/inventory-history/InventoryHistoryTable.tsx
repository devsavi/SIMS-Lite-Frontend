"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, FileText, User } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import {
  formatQuantity,
  getLedgerEntryTypeLabel,
} from "../../utils/inventory-utils";
import type { InventoryLedgerEntry } from "../../types";

export interface InventoryHistoryTableProps {
  data: InventoryLedgerEntry[];
  loading?: boolean;
  error?: Error | null;
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRefresh?: () => void;
  hideProductColumn?: boolean;
}

export function InventoryHistoryTable({
  data,
  loading = false,
  error = null,
  page = 1,
  pageSize = 20,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  hideProductColumn = false,
}: InventoryHistoryTableProps) {
  const columns = React.useMemo<ColumnDef<InventoryLedgerEntry>[]>(() => {
    const cols: ColumnDef<InventoryLedgerEntry>[] = [
      {
        accessorKey: "created_at",
        header: "Date & Time",
        cell: ({ row }) => {
          const dateStr = row.original.created_at;
          if (!dateStr)
            return <span className="text-xs text-muted-foreground">—</span>;
          try {
            return (
              <span className="text-xs font-medium text-foreground">
                {format(new Date(dateStr), "MMM dd, yyyy HH:mm:ss")}
              </span>
            );
          } catch {
            return <span className="text-xs text-muted-foreground">{dateStr}</span>;
          }
        },
      },
    ];

    if (!hideProductColumn) {
      cols.push({
        accessorKey: "product.name",
        header: "Product / SKU",
        cell: ({ row }) => {
          const p = row.original.product;
          return (
            <div className="flex flex-col text-xs">
              <Link
                href={`/inventory/${p?.id ?? ""}`}
                className="font-medium text-primary hover:underline line-clamp-1"
              >
                {p?.name ?? "Unknown Product"}
              </Link>
              <span className="text-muted-foreground">SKU: {p?.sku ?? "N/A"}</span>
            </div>
          );
        },
      });
    }

    cols.push(
      {
        accessorKey: "entry_type",
        header: "Action / Entry Type",
        cell: ({ row }) => {
          const entryType = row.original.entry_type;
          const label = getLedgerEntryTypeLabel(entryType);

          let variant: "active" | "approved" | "pending" | "cancelled" | "default" =
            "default";
          if (
            entryType === "PURCHASE_RECEIPT" ||
            entryType === "ADJUSTMENT_IN" ||
            entryType === "INITIAL_STOCK"
          ) {
            variant = "active";
          } else if (
            entryType === "ADJUSTMENT_OUT" ||
            entryType === "STOCK_RELEASE"
          ) {
            variant = "cancelled";
          }

          return (
            <StatusBadge variant={variant} label={label} className="text-xs" />
          );
        },
      },
      {
        accessorKey: "reference_number",
        header: "Reference",
        cell: ({ row }) => {
          const { reference_number, reference_type, reference_id, notes } =
            row.original;
          const refText =
            reference_number ||
            (reference_type ? reference_type : "Manual");

          let targetHref: string | null = null;
          if (reference_type === "GRN") {
            targetHref = `/procurement/grns/${reference_id ?? ""}`;
          } else if (reference_type === "STOCK_RELEASE") {
            targetHref = `/stock-release/${reference_id ?? ""}`;
          } else if (reference_type === "STOCK_ADJUSTMENT") {
            targetHref = `/inventory/adjustments/${reference_id ?? ""}`;
          }

          return (
            <div className="flex flex-col text-xs">
              {targetHref ? (
                <Link
                  href={targetHref}
                  className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>{refText}</span>
                </Link>
              ) : (
                <span className="font-medium text-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span>{refText}</span>
                </span>
              )}
              {notes && (
                <span className="text-muted-foreground line-clamp-1">{notes}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "quantity_change",
        header: "Quantity Change",
        cell: ({ row }) => {
          const change = row.original.quantity_change;
          const isPositive = change > 0;
          const isNegative = change < 0;

          return (
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isNegative
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : isNegative ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : null}
              <span>
                {isPositive
                  ? `+${formatQuantity(change)}`
                  : formatQuantity(change)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "quantity_after",
        header: "Balance After",
        cell: ({ row }) => {
          return (
            <span className="text-xs font-bold text-foreground">
              {formatQuantity(row.original.quantity_after)}
            </span>
          );
        },
      },
      {
        accessorKey: "created_by",
        header: "Performed By",
        cell: ({ row }) => {
          const user = row.original.created_by;
          if (!user)
            return (
              <span className="text-xs text-muted-foreground">System</span>
            );
          const fullName =
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            user.email;
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{fullName}</span>
            </div>
          );
        },
      }
    );

    return cols;
  }, [hideProductColumn]);

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRetry={onRefresh}
      serverSide
      totalRows={totalRecords}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyTitle="No ledger movements recorded"
      emptyDescription="No stock movement transactions match the selected criteria."
    />
  );
}
