"use client";

import * as React from "react";
import Link from "next/link";
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
import { POStatusBadge, POEmailStatusBadge } from "./POStatusBadge";
import type { PurchaseOrder, POFilters, POStatus } from "../types";
import { canAccess } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";

export interface PurchaseOrderTableProps {
  data?: PurchaseOrder[];
  total?: number;
  isLoading?: boolean;
  filters: POFilters;
  onFilterChange: (filters: Partial<POFilters>) => void;
  onRefresh?: () => void;
  suppliers?: Array<{ id: string; name: string }>;
}

export function PurchaseOrderTable({
  data = [],
  total = 0,
  isLoading = false,
  filters,
  onFilterChange,
  onRefresh,
  suppliers = [],
}: PurchaseOrderTableProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";

  const [columnVisibility, setColumnVisibility] = React.useState({
    poNumber: true,
    supplier: true,
    createdBy: true,
    createdDate: true,
    totalItems: true,
    totalAmount: true,
    emailStatus: true,
    status: true,
    actions: true,
  });

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const canCreatePO = canAccess(userRole, "purchase_orders.create");

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Search PO number..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full sm:w-[220px]"
          />

          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              onFilterChange({ status: val as POStatus | "ALL", page: 1 })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {suppliers.length > 0 && (
            <Select
              value={filters.supplierId || "ALL"}
              onValueChange={(val) =>
                onFilterChange({ supplierId: val, page: 1 })
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

          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                onFilterChange({ startDate: e.target.value, page: 1 })
              }
              className="w-[140px]"
            />
            <span className="text-sm text-slate-500">to</span>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                onFilterChange({ endDate: e.target.value, page: 1 })
              }
              className="w-[140px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
          {canCreatePO && (
            <Button asChild size="sm">
              <Link href="/procurement/purchase-orders/new">
                + Create PO
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columnVisibility.poNumber && <TableHead>PO Number</TableHead>}
              {columnVisibility.supplier && <TableHead>Supplier</TableHead>}
              {columnVisibility.createdBy && <TableHead>Created By</TableHead>}
              {columnVisibility.createdDate && <TableHead>Created Date</TableHead>}
              {columnVisibility.totalItems && <TableHead className="text-right">Total Items</TableHead>}
              {columnVisibility.totalAmount && <TableHead className="text-right">Total Amount</TableHead>}
              {columnVisibility.emailStatus && <TableHead>Email Status</TableHead>}
              {columnVisibility.status && <TableHead>Status</TableHead>}
              {columnVisibility.actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-muted-foreground"
                >
                  No purchase orders found matching the filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              data.map((po) => (
                <TableRow key={po.id}>
                  {columnVisibility.poNumber && (
                    <TableCell className="font-medium text-primary">
                      <Link
                        href={`/procurement/purchase-orders/${po.id}`}
                        className="hover:underline"
                      >
                        {po.poNumber}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.supplier && (
                    <TableCell>{po.supplierName || po.supplierId}</TableCell>
                  )}
                  {columnVisibility.createdBy && (
                    <TableCell>{po.createdBy?.name || "System"}</TableCell>
                  )}
                  {columnVisibility.createdDate && (
                    <TableCell>
                      {new Date(po.createdAt).toLocaleDateString()}
                    </TableCell>
                  )}
                  {columnVisibility.totalItems && (
                    <TableCell className="text-right">{po.totalItems}</TableCell>
                  )}
                  {columnVisibility.totalAmount && (
                    <TableCell className="text-right font-semibold">
                      ${po.totalAmount.toFixed(2)}
                    </TableCell>
                  )}
                  {columnVisibility.emailStatus && (
                    <TableCell>
                      <POEmailStatusBadge status={po.emailStatus} />
                    </TableCell>
                  )}
                  {columnVisibility.status && (
                    <TableCell>
                      <POStatusBadge status={po.status} />
                    </TableCell>
                  )}
                  {columnVisibility.actions && (
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/procurement/purchase-orders/${po.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing page {page} of {totalPages} ({total} total orders)
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
