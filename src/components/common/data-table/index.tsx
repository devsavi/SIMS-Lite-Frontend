"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type OnChangeFn,
  type PaginationState,
  type Row,
} from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  Eye,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";

// ---------------------------------------------------------------------------
// Re-export ColumnDef for convenience (feature modules don't need tanstack dep)
// ---------------------------------------------------------------------------
export type { ColumnDef, Row };

// ---------------------------------------------------------------------------
// DataTable props
// ---------------------------------------------------------------------------

export interface DataTableProps<TData> {
  /** Column definitions */
  columns: ColumnDef<TData>[];
  /** Row data */
  data: TData[];
  /** Loading state — shows skeleton rows */
  loading?: boolean;
  /** Error state */
  error?: unknown;
  /** Called when retry is clicked in error state */
  onRetry?: () => void;

  // ---- Server-side pagination ----
  /** Enable server-side pagination (disables client sorting/filter) */
  serverSide?: boolean;
  /** Total rows across all pages (required for server-side pagination) */
  totalRows?: number;
  /** Current page (1-indexed) */
  page?: number;
  /** Rows per page */
  pageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Called on page change */
  onPageChange?: (page: number) => void;
  /** Called on page size change */
  onPageSizeChange?: (pageSize: number) => void;

  // ---- Sorting ----
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** Enable multi-column sorting (hold shift). Defaults to true */
  multiSort?: boolean;

  // ---- Row selection ----
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Show a bulk action toolbar when rows are selected */
  bulkActions?: (selectedRows: Row<TData>[]) => React.ReactNode;

  // ---- Column visibility ----
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  /** Show column visibility toggle button */
  showColumnToggle?: boolean;

  // ---- Misc ----
  /** Passed to the wrapper <div>. Use for height limits + sticky header. */
  className?: string;
  /** Empty state props */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Caption for screen readers */
  caption?: string;
  /** Number of skeleton rows shown during loading */
  skeletonRows?: number;
}

// ---------------------------------------------------------------------------
// SortIcon
// ---------------------------------------------------------------------------

function SortIcon({
  direction,
}: {
  direction: "asc" | "desc" | false;
}) {
  if (direction === "asc") return <ArrowUp className="h-3.5 w-3.5 ml-1" aria-hidden="true" />;
  if (direction === "desc") return <ArrowDown className="h-3.5 w-3.5 ml-1" aria-hidden="true" />;
  return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" aria-hidden="true" />;
}

// ---------------------------------------------------------------------------
// ColumnToggle
// ---------------------------------------------------------------------------

export interface ColumnToggleProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
}

export function ColumnToggle<TData>({ table }: ColumnToggleProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Columns
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((col) => col.getCanHide())
          .map((col) => (
            <DropdownMenuCheckboxItem
              key={col.id}
              className="capitalize"
              checked={col.getIsVisible()}
              onCheckedChange={(value) => col.toggleVisibility(!!value)}
            >
              {col.id.replace(/_/g, " ")}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

/**
 * DataTable — enterprise-grade table with sorting, pagination, selection,
 * column visibility, loading/empty/error states.
 *
 * Supports both client-side and server-side data operations.
 *
 * @example
 * <DataTable
 *   columns={columns}
 *   data={products}
 *   loading={isLoading}
 *   serverSide
 *   totalRows={200}
 *   page={page}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 * />
 */
export function DataTable<TData>({
  columns,
  data,
  loading = false,
  error,
  onRetry,
  // Server-side pagination
  serverSide = false,
  totalRows,
  page = 1,
  pageSize = 20,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  // Sorting
  sorting: externalSorting,
  onSortingChange,
  multiSort = true,
  // Selection
  rowSelection: externalRowSelection,
  onRowSelectionChange,
  bulkActions,
  // Column visibility
  columnVisibility: externalVisibility,
  onColumnVisibilityChange,
  showColumnToggle = false,
  // Misc
  className,
  emptyTitle = "No results",
  emptyDescription,
  emptyAction,
  caption,
  skeletonRows = 5,
}: DataTableProps<TData>) {
  // Internal state (used when external state is not provided)
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const [internalVisibility, setInternalVisibility] = React.useState<VisibilityState>({});

  const sortingState = externalSorting ?? internalSorting;
  const rowSelectionState = externalRowSelection ?? internalRowSelection;
  const visibilityState = externalVisibility ?? internalVisibility;

  // Prepend select column if row selection is enabled
  const hasSelection = !!onRowSelectionChange || !!bulkActions || !!externalRowSelection;

  const allColumns = React.useMemo<ColumnDef<TData>[]>(() => {
    if (!hasSelection) return columns;
    const selectCol: ColumnDef<TData> = {
      id: "__select__",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };
    return [selectCol, ...columns];
  }, [columns, hasSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: !serverSide ? getSortedRowModel() : undefined,
    getFilteredRowModel: !serverSide ? getFilteredRowModel() : undefined,
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    enableMultiSort: multiSort,
    state: {
      sorting: sortingState,
      rowSelection: rowSelectionState,
      columnVisibility: visibilityState,
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalVisibility,
    rowCount: serverSide ? (totalRows ?? data.length) : undefined,
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelected = selectedRows.length > 0;

  // ---- Error state ----
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Bulk action toolbar */}
      {hasSelected && bulkActions && (
        <div className="flex items-center gap-3 border border-border bg-muted px-4 py-2">
          <span className="text-sm font-medium">
            {selectedRows.length} row{selectedRows.length === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkActions(selectedRows)}
          </div>
        </div>
      )}

      {/* Column toggle */}
      {showColumnToggle && (
        <div className="flex justify-end">
          <ColumnToggle table={table} />
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto border border-border">
        <Table aria-label={caption}>
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      className={cn(
                        "whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        canSort && "cursor-pointer select-none"
                      )}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                          ? "descending"
                          : canSort
                          ? "none"
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon direction={sorted} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: skeletonRows }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  {allColumns.map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="py-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    row.getIsSelected() && "bg-primary/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(serverSide || data.length > 0) && (onPageChange || !serverSide) && (
        <Pagination
          totalRows={serverSide ? (totalRows ?? 0) : data.length}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange ?? (() => {})}
          onPageSizeChange={onPageSizeChange}
          loading={loading}
        />
      )}
    </div>
  );
}
