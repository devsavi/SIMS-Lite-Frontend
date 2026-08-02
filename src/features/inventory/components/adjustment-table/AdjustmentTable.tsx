"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, Send, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { Button } from "@/app/components/ui/button";
import { StockAdjustmentStatusBadge } from "../adjustment-status/StockAdjustmentStatusBadge";
import type { StockAdjustmentSummary } from "../../types";

export interface AdjustmentTableProps {
  data: StockAdjustmentSummary[];
  loading?: boolean;
  error?: unknown;
  page: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSubmit?: (item: StockAdjustmentSummary) => void;
  onApprove?: (item: StockAdjustmentSummary) => void;
  onCancel?: (item: StockAdjustmentSummary) => void;
  onDelete?: (item: StockAdjustmentSummary) => void;
  onRefresh?: () => void;
}

function getAdjustmentTypeLabel(type: string): string {
  switch (type) {
    case "INCREASE": return "Increase (+)";
    case "DECREASE": return "Decrease (-)";
    case "RECOUNT": return "Recount";
    default: return type;
  }
}

function getAdjustmentTypeClass(type: string): string {
  if (type === "INCREASE") return "text-emerald-600 dark:text-emerald-400";
  if (type === "DECREASE") return "text-rose-600 dark:text-rose-400";
  return "text-blue-600 dark:text-blue-400";
}

export function AdjustmentTable({
  data,
  loading = false,
  error,
  page,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  onSubmit,
  onApprove,
  onCancel,
  onDelete,
  onRefresh,
}: AdjustmentTableProps) {
  const columns = React.useMemo<ColumnDef<StockAdjustmentSummary>[]>(
    () => [
      {
        accessorKey: "adjustment_number",
        header: "Adjustment #",
        cell: ({ row }) => (
          <Link
            href={`/inventory/adjustments/${row.original.id}`}
            className="font-mono font-semibold text-primary hover:underline text-xs"
          >
            {row.original.adjustment_number}
          </Link>
        ),
      },
      {
        accessorKey: "adjustment_type",
        header: "Type",
        cell: ({ row }) => (
          <span
            className={`text-xs font-semibold ${getAdjustmentTypeClass(row.original.adjustment_type)}`}
          >
            {getAdjustmentTypeLabel(row.original.adjustment_type)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StockAdjustmentStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">
            {row.original.reason}
          </span>
        ),
      },
      {
        accessorKey: "item_count",
        header: "Items",
        cell: ({ row }) => (
          <span className="text-xs font-mono font-medium text-foreground">
            {row.original.item_count}
          </span>
        ),
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        cell: ({ row }) => {
          const user = row.original.created_by;
          if (!user) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">
                {`${user.first_name} ${user.last_name}`.trim() || user.email}
              </span>
              <span className="text-muted-foreground">{user.email}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          try {
            return (
              <span className="text-xs text-muted-foreground">
                {format(new Date(row.original.created_at), "MMM dd, yyyy")}
              </span>
            );
          } catch {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const item = row.original;
          const isDraft = item.status === "DRAFT";
          const isSubmitted = item.status === "SUBMITTED";

          return (
            <div className="flex items-center gap-1.5 justify-end">
              <Link href={`/inventory/adjustments/${item.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">View</span>
                </Button>
              </Link>

              {isDraft && onSubmit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSubmit(item)}
                  className="h-8 px-2.5 text-xs gap-1.5 text-amber-600 border-amber-300 dark:border-amber-800"
                  title="Submit for approval"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit</span>
                </Button>
              )}

              {isSubmitted && onApprove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(item)}
                  className="h-8 px-2.5 text-xs gap-1.5 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                  title="Approve adjustment"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </Button>
              )}

              {(isDraft || isSubmitted) && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(item)}
                  className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  title="Cancel adjustment"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span className="sr-only">Cancel</span>
                </Button>
              )}

              {isDraft && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                  title="Delete draft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onSubmit, onApprove, onCancel, onDelete]
  );

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
      showColumnToggle
      emptyTitle="No stock adjustments found"
      emptyDescription="Create a new stock adjustment to start managing inventory corrections."
      caption="Stock Adjustments Table"
    />
  );
}
