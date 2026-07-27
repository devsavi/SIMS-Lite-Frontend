"use client";

import * as React from "react";
import { useGRNs } from "@/features/procurement/grns";
import { GRNTable } from "@/features/procurement/grns/components/GRNTable";
import type { GRNFilters } from "@/features/procurement/grns/types";
import { useSuppliers } from "@/features/suppliers/hooks/use-suppliers";

export default function GoodsReceivedNotesPage() {
  const [filters, setFilters] = React.useState<GRNFilters>({
    page: 1,
    limit: 10,
    status: "ALL",
    supplierId: "ALL",
  });

  const { data, isLoading, refetch } = useGRNs(filters);
  const { data: suppliersData } = useSuppliers();

  const suppliersList = React.useMemo(() => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    return suppliersData.data || [];
  }, [suppliersData]);

  const handleFilterChange = (newFilters: Partial<GRNFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Goods Received Notes (GRNs)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Receive deliveries against approved purchase orders and update physical stock levels.
        </p>
      </div>

      <GRNTable
        data={data?.data}
        total={data?.meta?.total || 0}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
        suppliers={suppliersList}
      />
    </div>
  );
}
