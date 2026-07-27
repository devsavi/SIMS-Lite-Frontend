"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { InventoryHistoryTable } from "../components/inventory-history/InventoryHistoryTable";
import { LedgerFilters } from "../components/filters/LedgerFilters";
import { useInventoryLedger } from "../hooks/use-inventory";
import type { LedgerFilterParams } from "../types";

export interface InventoryHistoryPageProps {
  initialProductId?: string;
}

export function InventoryHistoryPage({ initialProductId }: InventoryHistoryPageProps) {
  const [filters, setFilters] = React.useState<LedgerFilterParams>({
    page: 1,
    size: 20,
    product_id: initialProductId,
    entry_type: "ALL",
    reference_type: "ALL",
    from_date: "",
    to_date: "",
    search: "",
  });

  const {
    data: ledgerData,
    isLoading,
    error,
    refetch,
  } = useInventoryLedger(filters);

  const handleFilterChange = (updated: Partial<LedgerFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      size: 20,
      product_id: initialProductId,
      entry_type: "ALL",
      reference_type: "ALL",
      from_date: "",
      to_date: "",
      search: "",
    });
  };

  return (
    <PageContainer className="space-y-6">
      <div>
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Inventory Overview
        </Link>
      </div>

      <PageHeader
        title="Inventory Movement History"
        description="Complete audit ledger of all stock movements — receipts, releases, and adjustments — across the store."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        }
      />

      <LedgerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <InventoryHistoryTable
        data={ledgerData?.data ?? []}
        loading={isLoading}
        error={error ? (error as Error) : null}
        page={filters.page ?? 1}
        pageSize={filters.size ?? 20}
        totalRecords={ledgerData?.pagination?.total ?? 0}
        onPageChange={(page) => handleFilterChange({ page })}
        onPageSizeChange={(size) => handleFilterChange({ size, page: 1 })}
        onRefresh={() => refetch()}
      />
    </PageContainer>
  );
}
