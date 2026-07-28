"use client";

import * as React from "react";
import { DataTable } from "@/components/common/data-table";
import { getReleaseTableColumns } from "./ReleaseTableColumns";
import type { StockRelease } from "../../types/stock-release-types";
import type { UserRole } from "@/lib/auth";

export interface ReleaseTableProps {
  data: StockRelease[];
  loading?: boolean;
  error?: unknown;
  page: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  userRole?: UserRole;
  onEdit?: (release: StockRelease) => void;
  onSubmit?: (release: StockRelease) => void;
  onApprove?: (release: StockRelease) => void;
  onCancel?: (release: StockRelease) => void;
  onRefresh?: () => void;
}

export function ReleaseTable({
  data,
  loading = false,
  error,
  page,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  userRole,
  onEdit,
  onSubmit,
  onApprove,
  onCancel,
  onRefresh,
}: ReleaseTableProps) {
  const columns = React.useMemo(
    () =>
      getReleaseTableColumns({
        userRole,
        onEdit,
        onSubmit,
        onApprove,
        onCancel,
      }),
    [userRole, onEdit, onSubmit, onApprove, onCancel]
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
      emptyTitle="No stock releases found"
      emptyDescription="Create a new stock release request to begin managing inventory releases."
      caption="Stock Release Table"
    />
  );
}
