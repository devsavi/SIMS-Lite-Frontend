"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { GRNForm } from "@/features/procurement/grns/components/GRNForm";
import { useCreateGRN } from "@/features/procurement/grns/hooks/use-grns";
import {
  usePurchaseOrders,
  usePurchaseOrder,
} from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";
import { useProducts } from "@/features/master-data/hooks/use-products";
import type { GRNFormValues } from "@/features/procurement/grns/schemas/grn.schema";

export default function NewGRNPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poIdParam = searchParams.get("poId");

  const [selectedPOId, setSelectedPOId] = React.useState<string>(
    poIdParam || ""
  );

  const createMutation = useCreateGRN();

  // PO-based data
  const { data: posData, refetch: refetchPOs } = usePurchaseOrders({
    status: "APPROVED",
    size: 100,
  });

  // Refetch approved POs every time this page mounts so a recently-approved
  // PO shows up immediately without waiting for the cache to expire.
  React.useEffect(() => {
    void refetchPOs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approvedPOs = React.useMemo(() => posData?.data || [], [posData]);

  const { data: selectedPOResponse } = usePurchaseOrder(selectedPOId);
  const selectedPO = selectedPOResponse?.data;

  // Direct (PO-less) data
  const { data: suppliersData } = useSuppliers({ page: 1, page_size: 100, is_active: true });
  const { data: productsData } = useProducts({ page: 1, size: 100, active_only: true });

  const suppliers = React.useMemo(
    () =>
      (suppliersData?.data ?? []).map((s) => ({
        id: s.id,
        name: s.company_name,
      })),
    [suppliersData]
  );

  const products = React.useMemo(
    () =>
      (productsData?.data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        cost_price: p.cost_price,
      })),
    [productsData]
  );

  const handleSubmit = (values: GRNFormValues) => {
    if (values.mode === "po_based") {
      createMutation.mutate(
        {
          purchase_order_id: values.purchase_order_id,
          received_date: values.received_date,
          delivery_note_number: values.delivery_note_number || undefined,
          notes: values.notes || undefined,
          items: values.items.map((item) => ({
            po_item_id: item.po_item_id,
            product_id: item.product_id,
            quantity_received: item.quantity_received,
            unit_cost: item.unit_cost,
            notes: item.notes || undefined,
          })),
        },
        {
          onSuccess: (grn) => {
            router.push(`/procurement/grns/${grn.id}`);
          },
        }
      );
    } else {
      // PO-less: omit po_item_id entirely from items
      createMutation.mutate(
        {
          supplier_id: values.supplier_id,
          received_date: values.received_date,
          delivery_note_number: values.delivery_note_number || undefined,
          notes: values.notes || undefined,
          items: values.items.map((item) => ({
            product_id: item.product_id,
            quantity_received: item.quantity_received,
            unit_cost: item.unit_cost,
            notes: item.notes || undefined,
          })),
        },
        {
          onSuccess: (grn) => {
            router.push(`/procurement/grns/${grn.id}`);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Goods Received Note
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Receive a delivery against a Purchase Order or directly from a
            supplier.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      </div>

      <GRNForm
        approvedPOs={approvedPOs}
        selectedPO={selectedPO}
        onPOSelect={setSelectedPOId}
        suppliers={suppliers}
        products={products}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
