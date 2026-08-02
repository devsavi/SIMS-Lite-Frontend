"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/app/components/ui/button";
import { History, SlidersHorizontal } from "lucide-react";
import { InventorySummaryCards } from "../components/inventory-summary/InventorySummaryCards";
import { InventoryFilters } from "../components/filters/InventoryFilters";
import { InventoryTable } from "../components/inventory-table/InventoryTable";
import { StockAdjustmentDialog } from "../components/adjustment-dialog/StockAdjustmentDialog";
import { useInventoryList, useInventorySummary } from "../hooks/use-inventory";
import { useCategories } from "@/features/master-data/hooks/use-categories";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";
import { useAuthStore } from "@/stores/auth.store";
import type { InventoryFilterParams, InventoryItem } from "../types";

export function InventoryListPage() {
  const { user } = useAuthStore();
  // ADMIN: inventory:write | STORE_KEEPER: inventory:write | OFFICER: inventory:read only
  const canAdjust =
    user?.is_superuser ||
    user?.role === "admin" ||
    user?.role === "store_keeper";

  const [filters, setFilters] = React.useState<InventoryFilterParams>({
    page: 1,
    size: 20,
    search: "",
    category_id: "ALL",
    supplier_id: "ALL",
    stock_status: "ALL",
  });

  const [selectedAdjustmentItem, setSelectedAdjustmentItem] =
    React.useState<InventoryItem | null>(null);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = React.useState(false);

  const { data: summaryData, isLoading: isSummaryLoading } = useInventorySummary();
  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
    isRefetching,
  } = useInventoryList(filters);

  // Fetch categories and suppliers for filter dropdowns
  const { data: categoriesData } = useCategories({ page: 1, page_size: 100 });
  const { data: suppliersData } = useSuppliers({ page: 1, page_size: 100 });

  const categories = React.useMemo(
    () => (categoriesData?.data ?? []).map((c) => ({ id: c.id, name: c.name })),
    [categoriesData]
  );
  const suppliers = React.useMemo(
    () => (suppliersData?.data ?? []).map((s) => ({ id: s.id, name: s.company_name })),
    [suppliersData]
  );

  const handleFilterChange = (updated: Partial<InventoryFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      size: 20,
      search: "",
      category_id: "ALL",
      supplier_id: "ALL",
      stock_status: "ALL",
    });
  };

  const handleOpenAdjustment = (item: InventoryItem) => {
    setSelectedAdjustmentItem(item);
    setAdjustmentDialogOpen(true);
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Store-wide real-time visibility into inventory stock levels, valuations, and stock adjustments."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inventory/adjustments">
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Stock Adjustments</span>
              </Button>
            </Link>
            <Link href="/inventory/history">
              <Button variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                <span>Inventory History</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Summary Cards */}
      <InventorySummaryCards summary={summaryData} loading={isSummaryLoading} />

      {/* Filters Toolbar */}
      <InventoryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={() => refetchList()}
        isRefreshing={isRefetching}
        categories={categories}
        suppliers={suppliers}
      />

      {/* Inventory Table */}
      <InventoryTable
        data={listData?.data ?? []}
        loading={isListLoading}
        error={listError ? (listError as Error) : null}
        page={filters.page ?? 1}
        pageSize={filters.size ?? 20}
        totalRecords={listData?.pagination?.total ?? 0}
        onPageChange={(page) => handleFilterChange({ page })}
        onPageSizeChange={(size) => handleFilterChange({ size, page: 1 })}
        onAdjustStock={canAdjust ? handleOpenAdjustment : undefined}
        onRefresh={() => refetchList()}
      />

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustmentDialogOpen}
        onOpenChange={setAdjustmentDialogOpen}
        inventoryItem={selectedAdjustmentItem}
        onSuccess={() => refetchList()}
      />
    </PageContainer>
  );
}
