"use client";

import * as React from "react";
import { usePurchaseOrders } from "@/features/procurement/purchase-orders";
import { PurchaseOrderTable } from "@/features/procurement/purchase-orders/components/PurchaseOrderTable";
import type { POFilters } from "@/features/procurement/purchase-orders/types";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";

export default function PurchaseOrdersPage() {
  const [filters, setFilters] = React.useState<POFilters>({
    page: 1,
    limit: 10,
    status: "ALL",
    supplierId: "ALL",
  });

  const { data, isLoading, refetch } = usePurchaseOrders(filters);
  const { data: suppliersData } = useSuppliers();

  const suppliersList = React.useMemo(() => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    return suppliersData.data || [];
  }, [suppliersData]);

  const handleFilterChange = (newFilters: Partial<POFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage supplier purchase orders, track approval status, and trigger GRNs.
        </p>
      </div>

      <PurchaseOrderTable
        data={data?.data}
        total={data?.meta?.total || 0}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
        suppliers={suppliersList.map((s: any) => ({ id: s.id, name: s.name || s.company_name || s.supplier_name || "" }))}
      />
    </div>
  );
}
