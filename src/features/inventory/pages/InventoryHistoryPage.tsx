"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { Button } from "@/app/components/ui/button";
import { InventoryHistoryTable } from "../components/inventory-history/InventoryHistoryTable";
import { LedgerFilters } from "../components/filters/LedgerFilters";
import { useInventoryLedger } from "../hooks/use-inventory";
import type { LedgerFilterParams } from "../types";

export interface InventoryHistoryPageProps {
  initialProductId?: string;
}

export function InventoryHistoryPage({ initialProductId }: InventoryHistoryPageProps) {
  const router = useRouter();

  const [filters, setFilters] = React.useState<LedgerFilterParams>({
    page: 1,
    size: 20,
    product_id: initialProductId,
    entry_type: "ALL",
    reference_type: "ALL",
    period: "day",
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
      period: "day",
      from_date: "",
      to_date: "",
      search: "",
    });
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Inventory Movement History"
        description="Complete audit ledger of all stock movements — receipts, releases, and adjustments — across the store."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Inventory", href: "/inventory" },
              { label: "Movement History" },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
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
