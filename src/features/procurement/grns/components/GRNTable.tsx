"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Download, FileText, CheckCircle, XCircle, SendHorizonal } from "lucide-react";
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
import { RowActionsMenu, RowActionsMenuItem } from "@/components/common";
import { GRNStatusBadge } from "./GRNStatusBadge";
import type { GoodsReceivedNote, GRNFilters, GRNStatus, GRNPeriod } from "../types";
import { canAccess } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";

export interface GRNTableProps {
  data?: GoodsReceivedNote[];
  total?: number;
  pages?: number;
  isLoading?: boolean;
  filters: GRNFilters;
  onFilterChange: (filters: Partial<GRNFilters>) => void;
  onRefresh?: () => void;
  /** Called when user submits a DRAFT GRN inline. */
  onSubmit?: (grn: GoodsReceivedNote) => void;
  /** Called when user approves a SUBMITTED GRN inline. */
  onApprove?: (grn: GoodsReceivedNote) => void;
  /** Called when user cancels a DRAFT or SUBMITTED GRN inline. */
  onCancel?: (grn: GoodsReceivedNote) => void;
  /** ID of the GRN currently being actioned (disables its buttons). */
  actionLoadingId?: string | null;
  /** Called when user clicks "View Document" in the row menu. */
  onViewDocument?: (grn: GoodsReceivedNote) => void;
  /** Called when user clicks "Download Document" in the row menu. */
  onDownloadDocument?: (grn: GoodsReceivedNote) => void;
}

export function GRNTable({
  data = [],
  total = 0,
  pages = 1,
  isLoading = false,
  filters,
  onFilterChange,
  onRefresh,
  onSubmit,
  onApprove,
  onCancel,
  actionLoadingId = null,
  onViewDocument,
  onDownloadDocument,
}: GRNTableProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";

  const page = filters.page || 1;
  const size = filters.size || 20;
  const totalPages = pages || Math.ceil(total / size) || 1;

  const canCreateGRN = canAccess(userRole, "grn.create");
  const canEdit = canAccess(userRole, "grn.edit");
  const isCustomPeriod = filters.period === "custom";

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <Input
            placeholder="Search GRN / PO number..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full sm:w-[220px]"
          />

          {/* Status filter */}
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
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Period filter */}
          <Select
            value={filters.period || "day"}
            onValueChange={(val) => {
              onFilterChange({
                period: val as GRNPeriod,
                from_date: val !== "custom" ? undefined : filters.from_date,
                to_date: val !== "custom" ? undefined : filters.to_date,
                page: 1,
              });
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom date range */}
          {isCustomPeriod && (
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
          {canCreateGRN && (
            <Button asChild size="sm">
              <Link href="/procurement/grns/new">+ Create GRN</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-none border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GRN Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purchase Order</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  No Goods Received Notes found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((grn) => {
                const isActioning = actionLoadingId === grn.id;
                const showSubmit = canEdit && grn.status === "DRAFT" && onSubmit;
                const showApprove = canEdit && grn.status === "SUBMITTED" && onApprove;
                const showCancel =
                  canEdit &&
                  (grn.status === "DRAFT" || grn.status === "SUBMITTED") &&
                  onCancel;

                return (
                  <TableRow key={grn.id}>
                    <TableCell className="font-medium text-primary">
                      <Link
                        href={`/procurement/grns/${grn.id}`}
                        className="hover:underline"
                      >
                        {grn.grn_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {grn.purchase_order_id ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border bg-[#DCEBFC] text-[#1D63C4] border-[#B4D5F8] dark:bg-[rgba(96,165,250,0.15)] dark:text-[#60A5FA] dark:border-[rgba(96,165,250,0.4)]">
                          PO-Based
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border bg-[#EAE1FB] text-[#6D28D9] border-[#D3C0F5] dark:bg-[rgba(167,139,250,0.15)] dark:text-[#A78BFA] dark:border-[rgba(167,139,250,0.4)]">
                          Direct
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {grn.purchase_order_id && grn.po_number ? (
                        <Link
                          href={`/procurement/purchase-orders/${grn.purchase_order_id}`}
                          className="text-primary hover:underline"
                        >
                          {grn.po_number}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>{grn.supplier?.name ?? "—"}</TableCell>
                    <TableCell>
                      {new Date(grn.received_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {grn.created_by
                        ? `${grn.created_by.first_name} ${grn.created_by.last_name}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <GRNStatusBadge status={grn.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <Link
                          href={`/procurement/grns/${grn.id}`}
                          title="View details"
                          aria-label={`View ${grn.grn_number}`}
                          className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Submit — DRAFT only */}
                        {showSubmit && (
                          <button
                            type="button"
                            title="Submit GRN for approval"
                            aria-label={`Submit ${grn.grn_number}`}
                            disabled={isActioning}
                            onClick={() => onSubmit(grn)}
                            className="rounded-none p-1 text-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 dark:hover:bg-blue-950/30"
                          >
                            <SendHorizonal className="h-4 w-4" />
                          </button>
                        )}

                        {/* Approve — SUBMITTED only */}
                        {showApprove && (
                          <button
                            type="button"
                            title="Approve GRN"
                            aria-label={`Approve ${grn.grn_number}`}
                            disabled={isActioning}
                            onClick={() => onApprove(grn)}
                            className="rounded-none p-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:hover:bg-emerald-950/30"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Cancel — DRAFT or SUBMITTED */}
                        {showCancel && (
                          <button
                            type="button"
                            title="Cancel GRN"
                            aria-label={`Cancel ${grn.grn_number}`}
                            disabled={isActioning}
                            onClick={() => onCancel(grn)}
                            className="rounded-none p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-950/30"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Overflow menu — document actions */}
                        {grn.document_path && (onViewDocument || onDownloadDocument) && (
                          <RowActionsMenu label={`More actions for ${grn.grn_number}`}>
                            {onViewDocument && (
                              <RowActionsMenuItem
                                icon={<FileText className="h-3.5 w-3.5" />}
                                onClick={() => onViewDocument(grn)}
                              >
                                View Document
                              </RowActionsMenuItem>
                            )}
                            {onDownloadDocument && (
                              <RowActionsMenuItem
                                icon={<Download className="h-3.5 w-3.5" />}
                                onClick={() => onDownloadDocument(grn)}
                              >
                                Download Document
                              </RowActionsMenuItem>
                            )}
                          </RowActionsMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
