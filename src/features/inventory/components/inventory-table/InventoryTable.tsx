"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, SlidersHorizontal } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { Button } from "@/app/components/ui/button";
import { StockStatusBadge } from "../stock-status/StockStatusBadge";
import { formatQuantity, formatCurrency } from "../../utils/inventory-utils";
import { useAuthStore } from "@/stores/auth.store";
import type { InventoryItem } from "../../types";

export interface InventoryTableProps {
  data: InventoryItem[];
  loading?: boolean;
  error?: Error | null;
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAdjustStock?: (item: InventoryItem) => void;
  onRefresh?: () => void;
}

export function InventoryTable({
  data,
  loading = false,
  error = null,
  page = 1,
  pageSize = 20,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
  onAdjustStock,
  onRefresh,
}: InventoryTableProps) {
  const { user } = useAuthStore();
  // ADMIN: inventory:write | STORE_KEEPER: inventory:write | OFFICER: inventory:read only
  const canAdjust =
    user?.is_superuser ||
    user?.role === "admin" ||
    user?.role === "store_keeper";

  const columns = React.useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "product.name",
        header: "Product / SKU",
        cell: ({ row }) => {
          const item = row.original;
          const product = item.product;
          return (
            <div className="flex flex-col gap-0.5">
              <Link
                href={`/inventory/${product?.id ?? item.id}`}
                className="font-medium text-primary hover:underline line-clamp-1"
              >
                {product?.name ?? "Unknown Product"}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>SKU: {product?.sku ?? "N/A"}</span>
                {product?.barcode && <span>• Barcode: {product.barcode}</span>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "product.category_name",
        header: "Category & Brand",
        cell: ({ row }) => {
          const p = row.original.product;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">
                {p?.category_name ?? "Uncategorized"}
              </span>
              <span className="text-muted-foreground">{p?.brand_name ?? "No Brand"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "product.supplier_name",
        header: "Supplier",
        cell: ({ row }) => {
          const supplierName = row.original.product?.supplier_name;
          return (
            <span className="text-xs text-muted-foreground">
              {supplierName ?? "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "quantity_on_hand",
        header: "Current Stock",
        cell: ({ row }) => {
          const qty = row.original.quantity_on_hand;
          const uomCode = row.original.product?.uom_code;
          const uomName = row.original.product?.uom_name;
          const uom = uomCode ?? uomName;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {formatQuantity(qty)}{" "}
                {uom && (
                  <span className="text-xs font-normal text-muted-foreground">{uom}</span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "product.reorder_level",
        header: "Reorder Level",
        cell: ({ row }) => {
          const level = row.original.product?.reorder_level ?? 0;
          return (
            <span className="text-xs text-muted-foreground">{formatQuantity(level)}</span>
          );
        },
      },
      {
        accessorKey: "stock_status",
        header: "Stock Status",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <StockStatusBadge
              quantityOnHand={item.quantity_on_hand}
              reorderLevel={item.product?.reorder_level ?? 0}
            />
          );
        },
      },
      {
        accessorKey: "stock_value",
        header: "Stock Value",
        cell: ({ row }) => {
          return (
            <span className="text-xs font-medium text-foreground">
              {formatCurrency(row.original.stock_value)}
            </span>
          );
        },
      },
      {
        accessorKey: "last_updated_at",
        header: "Last Updated",
        cell: ({ row }) => {
          const dt = row.original.last_updated_at || row.original.updated_at;
          if (!dt) return <span className="text-xs text-muted-foreground">—</span>;
          try {
            return (
              <span className="text-xs text-muted-foreground">
                {format(new Date(dt), "MMM dd, yyyy HH:mm")}
              </span>
            );
          } catch {
            return <span className="text-xs text-muted-foreground">{dt}</span>;
          }
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          const productId = item.product?.id ?? item.id;
          return (
            <div className="flex items-center gap-1.5 justify-end">
              <Link href={`/inventory/${productId}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="View details"
                >
                  <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">View inventory details</span>
                </Button>
              </Link>

              {canAdjust && onAdjustStock && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjustStock(item)}
                  className="h-8 px-2.5 text-xs gap-1.5"
                  title="Adjust Stock"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Adjust</span>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [canAdjust, onAdjustStock]
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
      emptyTitle="No inventory items found"
      emptyDescription="No products match the selected inventory filters."
    />
  );
}
