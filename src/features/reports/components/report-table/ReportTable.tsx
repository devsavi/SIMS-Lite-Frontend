"use client";

import * as React from "react";
import { StatusBadge, type StatusVariant } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import type {
  GrnReportRow,
  InventoryMovementReportRow,
  InventoryReportRow,
  LowStockReportRow,
  ProductReportRow,
  PurchaseOrderReportRow,
  ReportType,
  StockReleaseReportRow,
  SupplierReportRow,
} from "../../types";

interface ReportTableProps {
  reportType: ReportType;
  data: unknown[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function getBadgeVariant(status: string): StatusVariant {
  switch (status) {
    case "IN_STOCK":
      return "in-stock";
    case "LOW_STOCK":
      return "low-stock";
    case "OUT_OF_STOCK":
      return "out-of-stock";
    case "DRAFT":
      return "draft";
    case "PENDING_APPROVAL":
      return "pending";
    case "APPROVED":
      return "approved";
    case "PARTIALLY_RECEIVED":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "cancelled";
    case "SUBMITTED":
      return "info";
    case "ACTIVE":
      return "active";
    case "INACTIVE":
      return "inactive";
    case "INFLOW":
      return "success";
    case "OUTFLOW":
      return "error";
    case "ADJUSTMENT_ADD":
      return "info";
    case "ADJUSTMENT_SUBTRACT":
      return "warning";
    case "TRANSFER":
      return "default";
    default:
      return "default";
  }
}

export function ReportTable({
  reportType,
  data,
  loading,
  page = 1,
  totalPages = 1,
  onPageChange,
}: ReportTableProps) {
  if (loading) {
    return <LoadingState text="Loading report data..." />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Report Data Found"
        description="Try adjusting your filter criteria or date range to see records."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
            {reportType === "inventory" && (
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Current Qty</th>
                <th className="px-4 py-3 text-right">Min Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            )}
            {reportType === "low-stock" && (
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Current Qty</th>
                <th className="px-4 py-3 text-right">Min Stock</th>
                <th className="px-4 py-3 text-right">Shortage</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            )}
            {reportType === "po" && (
              <tr>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
              </tr>
            )}
            {reportType === "grn" && (
              <tr>
                <th className="px-4 py-3">GRN Number</th>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Received By</th>
                <th className="px-4 py-3">Received Date</th>
                <th className="px-4 py-3 text-right">Items Received</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            )}
            {reportType === "stock-release" && (
              <tr>
                <th className="px-4 py-3">Release Number</th>
                <th className="px-4 py-3">Release Date</th>
                <th className="px-4 py-3">Released By</th>
                <th className="px-4 py-3 text-right">Total Items</th>
                <th className="px-4 py-3 text-right">Total Quantity</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            )}
            {reportType === "movement" && (
              <tr>
                <th className="px-4 py-3">Date/Time</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Change</th>
                <th className="px-4 py-3 text-right">Balance After</th>
                <th className="px-4 py-3">User</th>
              </tr>
            )}
            {reportType === "supplier" && (
              <tr>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3 text-right">PO Count</th>
                <th className="px-4 py-3 text-right">GRN Count</th>
                <th className="px-4 py-3 text-right">Total Purchase Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            )}
            {reportType === "product" && (
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Current Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-border">
            {reportType === "inventory" &&
              (data as InventoryReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.categoryName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.brandName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.supplierName}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.currentQuantity}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.minimumStock}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.stockStatus)} />
                  </td>
                </tr>
              ))}

            {reportType === "low-stock" &&
              (data as LowStockReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.categoryName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.supplierName}</td>
                  <td className="px-4 py-3 text-right font-semibold text-destructive">{row.currentQuantity}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.minimumStock}</td>
                  <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400">{row.shortageQuantity}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.stockStatus)} />
                  </td>
                </tr>
              ))}

            {reportType === "po" &&
              (data as PurchaseOrderReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium font-mono text-primary text-xs">{row.poNumber}</td>
                  <td className="px-4 py-3 text-foreground">{row.supplierName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.createdBy}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{row.createdDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.status)} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">${row.totalAmount.toLocaleString()}</td>
                </tr>
              ))}

            {reportType === "grn" &&
              (data as GrnReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium font-mono text-primary text-xs">{row.grnNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.poNumber}</td>
                  <td className="px-4 py-3 text-foreground">{row.supplierName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.receivedBy}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{row.receivedDate}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.totalItemsReceived}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.status)} />
                  </td>
                </tr>
              ))}

            {reportType === "stock-release" &&
              (data as StockReleaseReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium font-mono text-primary text-xs">{row.releaseNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{row.releaseDate}</td>
                  <td className="px-4 py-3 text-foreground">{row.releasedBy}</td>
                  <td className="px-4 py-3 text-right">{row.totalItems}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.totalQuantity}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.status)} />
                  </td>
                </tr>
              ))}

            {reportType === "movement" &&
              (data as InventoryMovementReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{row.timestamp}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.actionType)} label={row.actionType} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.referenceNumber}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      row.quantityChange > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {row.quantityChange > 0 ? `+${row.quantityChange}` : row.quantityChange}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{row.balanceAfter}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{row.user}</td>
                </tr>
              ))}

            {reportType === "supplier" &&
              (data as SupplierReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.supplierName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.contactPerson}</td>
                  <td className="px-4 py-3 text-right font-medium">{row.poCount}</td>
                  <td className="px-4 py-3 text-right font-medium">{row.grnCount}</td>
                  <td className="px-4 py-3 text-right font-semibold">${row.totalPurchaseValue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.status)} />
                  </td>
                </tr>
              ))}

            {reportType === "product" &&
              (data as ProductReportRow[]).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.brandName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.categoryName}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.currentStock}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={getBadgeVariant(row.status)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between py-2 text-xs text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1 border border-input rounded-md hover:bg-accent disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1 border border-input rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
