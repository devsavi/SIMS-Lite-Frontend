"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/app/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationProps {
  /** Total number of rows */
  totalRows: number;
  /** Current page (1-indexed) */
  page: number;
  /** Number of rows per page */
  pageSize: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Called when pageSize changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Whether the table is in a loading state */
  loading?: boolean;
  className?: string;
}

/**
 * Pagination — full-featured pagination controls.
 *
 * @example
 * <Pagination
 *   totalRows={200}
 *   page={1}
 *   pageSize={20}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 */
export function Pagination({
  totalRows,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  loading = false,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, totalRows);
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      aria-label="Pagination"
    >
      {/* Left: showing rows info */}
      <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic>
        {totalRows === 0
          ? "No results"
          : `Showing ${from}–${to} of ${totalRows.toLocaleString()} results`}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                onPageSizeChange(Number(v));
                onPageChange(1);
              }}
              disabled={loading}
            >
              <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page X of Y */}
        <span className="text-sm font-medium text-muted-foreground" aria-live="polite" aria-atomic>
          Page {page} of {totalPages}
        </span>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={page <= 1 || loading}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages || loading}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
