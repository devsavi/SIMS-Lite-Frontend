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
import { GRNStatusBadge } from "./GRNStatusBadge";
import type { GoodsReceivedNote, GRNFilters, GRNStatus } from "../types";
import { canAccess } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";

export interface GRNTableProps {
  data?: GoodsReceivedNote[];
  total?: number;
  isLoading?: boolean;
  filters: GRNFilters;
  onFilterChange: (filters: Partial<GRNFilters>) => void;
  onRefresh?: () => void;
  suppliers?: Array<{ id: string; name: string }>;
}

export function GRNTable({
  data = [],
  total = 0,
  isLoading = false,
  filters,
  onFilterChange,
  onRefresh,
  suppliers = [],
}: GRNTableProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const canCreateGRN = canAccess(userRole, "grn.create");

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Search GRN / PO number..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full sm:w-[220px]"
          />

          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              onFilterChange({ status: val as GRNStatus | "ALL", page: 1 })
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
          {canCreateGRN && (
            <Button asChild size="sm">
              <Link href="/procurement/grns/new">+ Create GRN</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GRN Number</TableHead>
              <TableHead>Purchase Order</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Received By</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No Goods Received Notes found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((grn) => (
                <TableRow key={grn.id}>
                  <TableCell className="font-medium text-primary">
                    <Link
                      href={`/procurement/grns/${grn.id}`}
                      className="hover:underline"
                    >
                      {grn.grnNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/procurement/purchase-orders/${grn.purchaseOrderId}`}
                      className="text-slate-700 dark:text-slate-300 hover:underline"
                    >
                      {grn.poNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{grn.supplierName || grn.supplierId}</TableCell>
                  <TableCell>{grn.receivedBy?.name || "System"}</TableCell>
                  <TableCell>
                    {new Date(grn.receivedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <GRNStatusBadge status={grn.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/procurement/grns/${grn.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing page {page} of {totalPages} ({total} total GRNs)
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
