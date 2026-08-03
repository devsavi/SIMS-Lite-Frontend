"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Printer, Copy, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Skeleton } from "@/app/components/ui/skeleton";
import { PermissionGuard, RowActionsMenu, RowActionsMenuItem } from "@/components/common";
import { POStatusBadge } from "./POStatusBadge";
import type { PurchaseOrderListItem, POFilters, POStatus, POPeriod } from "../types";
import { canAccess } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency } from "@/utils/format";

export interface PurchaseOrderTableProps {
  data?: PurchaseOrderListItem[];
  total?: number;
  isLoading?: boolean;
  filters: POFilters;
  onFilterChange: (filters: Partial<POFilters>) => void;
  onRefresh?: () => void;
  suppliers?: Array<{ id: string; name: string }>;
  onPrint?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (po: PurchaseOrderListItem) => void;
  isPrintLoading?: string | null;
}

const PERIOD_OPTIONS: Array<{ value: POPeriod; label: string }> = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

export function PurchaseOrderTable({
  data = [],
  total = 0,
  isLoading = false,
  filters,
  onFilterChange,
  onRefresh,
  suppliers = [],
  onPrint,
  onDuplicate,
  onDelete,
  isPrintLoading = null,
}: PurchaseOrderTableProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";

  const page = filters.page || 1;
  const size = filters.size || 20;
  const totalPages = Math.ceil(total / size) || 1;
  const canCreatePO = canAccess(userRole, "purchase_orders.create");

  const handlePeriodChange = (val: string) => {
    const period = val === "ALL" ? undefined : (val as POPeriod);
    onFilterChange({
      period,
      from_date: undefined,
      to_date: undefined,
      page: 1,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          {/* Search */}
          <Input
            placeholder="Search PO number..."
            value={filters.search || ""}
            onChange={(e) =>
              onFilterChange({ search: e.target.value, page: 1 })
            }
            className="w-full sm:w-[220px]"
          />

          {/* Status */}
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              onFilterChange({ status: val as POStatus | "ALL", page: 1 })
            }
          >
            <SelectTrigger className="w-[175px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="PARTIALLY_RECEIVED">
                Partially Received
              </SelectItem>
              <SelectItem value="FULLY_RECEIVED">Fully Received</SelectItem>
            </SelectContent>
          </Select>

          {/* Supplier */}
          {suppliers.length > 0 && (
            <Select
              value={filters.supplier_id || "ALL"}
              onValueChange={(val) =>
                onFilterChange({ supplier_id: val, page: 1 })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Suppliers</SelectItem>
                {suppliers.map((sup) => (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Period */}
          <Select
            value={filters.period || "day"}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom date range */}
          {filters.period === "custom" && (
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={filters.from_date || ""}
                onChange={(e) =>
                  onFilterChange({ from_date: e.target.value, page: 1 })
                }
                className="w-[140px]"
              />
              <span className="text-sm text-slate-500">to</span>
              <Input
                type="date"
                value={filters.to_date || ""}
                onChange={(e) =>
                  onFilterChange({ to_date: e.target.value, page: 1 })
                }
                className="w-[140px]"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
          {canCreatePO && (
            <Button asChild size="sm">
              <Link href="/procurement/purchase-orders/new">+ Create PO</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-none border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  No purchase orders found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium text-primary">
                    <Link
                      href={`/procurement/purchase-orders/${po.id}`}
                      className="hover:underline"
                    >
                      {po.po_number}
                    </Link>
                  </TableCell>
                  <TableCell>{po.supplier.name}</TableCell>
                  <TableCell>
                    {new Date(po.order_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {po.expected_delivery_date
                      ? new Date(po.expected_delivery_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">{po.item_count}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(po.total_amount)}
                  </TableCell>
                  <TableCell>
                    <POStatusBadge status={po.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <PermissionGuard permission="purchase_orders.view">
                        <Link
                          href={`/procurement/purchase-orders/${po.id}`}
                          title="View details"
                          aria-label={`View ${po.po_number}`}
                          className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </PermissionGuard>

                      {/* Print */}
                      {onPrint && (
                        <button
                          type="button"
                          onClick={() => onPrint(po.id)}
                          title="Print purchase order"
                          aria-label={`Print ${po.po_number}`}
                          disabled={isPrintLoading === po.id}
                          className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      )}

                      {/* Overflow */}
                      {(onDuplicate || onDelete) && (
                        <RowActionsMenu label={`More actions for ${po.po_number}`}>
                          {onDuplicate && (
                            <RowActionsMenuItem
                              icon={<Copy className="h-3.5 w-3.5" />}
                              onClick={() => onDuplicate(po.id)}
                            >
                              Duplicate
                            </RowActionsMenuItem>
                          )}
                          {onDelete && po.status === "DRAFT" && (
                            <PermissionGuard permission="purchase_orders.delete">
                              <RowActionsMenuItem
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => onDelete(po)}
                                destructive
                              >
                                Delete
                              </RowActionsMenuItem>
                            </PermissionGuard>
                          )}
                        </RowActionsMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Page {page} of {totalPages} ({total} total)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onFilterChange({ page: page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onFilterChange({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
