"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  usePurchaseOrders,
  useDuplicatePurchaseOrder,
  useDeletePurchaseOrder,
  usePurchaseOrderPrint,
} from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import { PurchaseOrderTable } from "@/features/procurement/purchase-orders/components/PurchaseOrderTable";
import { POPrintDialog } from "@/features/procurement/purchase-orders/components/POPrintDialog";
import { DeleteDialog } from "@/components/common";
import type {
  POFilters,
  PurchaseOrderListItem,
} from "@/features/procurement/purchase-orders/types";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";

export default function PurchaseOrdersPage() {
  const router = useRouter();

  const [filters, setFilters] = React.useState<POFilters>({
    page: 1,
    size: 20,
    status: "ALL",
    supplier_id: "ALL",
    period: "day",
  });

  // Print state — hold the PO ID whose print data we want to fetch
  const [printId, setPrintId] = React.useState<string | null>(null);
  const [printOpen, setPrintOpen] = React.useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = React.useState<PurchaseOrderListItem | null>(null);

  const { data, isLoading, refetch } = usePurchaseOrders(filters);
  const { data: suppliersData } = useSuppliers();
  const duplicateMutation = useDuplicatePurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  // Fetch print data only when a PO is selected for printing
  const { data: printResponse, isFetching: isPrintFetching } =
    usePurchaseOrderPrint(printId ?? "", Boolean(printId));

  const suppliersList = React.useMemo(() => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    return (suppliersData as any).data || [];
  }, [suppliersData]);

  const handleFilterChange = (newFilters: Partial<POFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePrint = (id: string) => {
    setPrintId(id);
    setPrintOpen(true);
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id, {
      onSuccess: (newPo) => {
        router.push(`/procurement/purchase-orders/${newPo.id}`);
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage supplier purchase orders and track approval status.
        </p>
      </div>

      <PurchaseOrderTable
        data={data?.data}
        total={data?.pagination?.total || 0}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
        suppliers={suppliersList.map((s: any) => ({
          id: s.id,
          name: s.name || s.company_name || s.supplier_name || "",
        }))}
        onPrint={handlePrint}
        isPrintLoading={isPrintFetching ? printId : null}
        onDuplicate={handleDuplicate}
        onDelete={setDeleteTarget}
      />

      {/* Print Preview Dialog */}
      <POPrintDialog
        open={printOpen}
        onOpenChange={(op) => {
          setPrintOpen(op);
          if (!op) setPrintId(null);
        }}
        data={printResponse?.data}
        isLoading={isPrintFetching}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(op) => !op && setDeleteTarget(null)}
        itemName={deleteTarget?.po_number}
        description={`Delete draft purchase order "${deleteTarget?.po_number}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
