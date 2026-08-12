"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { GRNForm } from "@/features/procurement/grns/components/GRNForm";
import { useCreateGRN } from "@/features/procurement/grns/hooks/use-grns";
import { usePurchaseOrders } from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";
import { useProducts } from "@/features/master-data/hooks/use-products";
import type { GRNFormValues } from "@/features/procurement/grns/schemas/grn.schema";
import type { PurchaseOrder } from "@/features/procurement/purchase-orders/types";

export default function NewGRNPage() {
  const router = useRouter();
  const createMutation = useCreateGRN();
  const [selectedPOId, setSelectedPOId] = React.useState<string>("");

  const { data: posData } = usePurchaseOrders();
  const { data: suppliersData } = useSuppliers();
  const { data: productsData } = useProducts();

  const approvedPOs = React.useMemo(() => {
    const list: PurchaseOrder[] = Array.isArray(posData)
      ? posData
      : (posData as any)?.data || [];
    return list.filter((po) => po.status === "APPROVED" || po.status === "PARTIALLY_RECEIVED");
  }, [posData]);

  const selectedPO = React.useMemo(
    () => approvedPOs.find((po) => po.id === selectedPOId),
    [approvedPOs, selectedPOId]
  );

  const suppliers = React.useMemo(() => {
    const list = Array.isArray(suppliersData)
      ? suppliersData
      : (suppliersData as any)?.data || [];
    return list.map((s: any) => ({
      id: s.id,
      name: s.name || s.company_name || s.supplier_name || "",
    }));
  }, [suppliersData]);

  const products = React.useMemo(() => {
    const list = Array.isArray(productsData)
      ? productsData
      : (productsData as any)?.data || [];
    return list.map((p: any) => ({
      id: p.id,
      name: p.name || p.product_name || "",
      sku: p.sku || "",
      cost_price: p.cost_price ?? p.costPrice,
    }));
  }, [productsData]);

  const handleSubmit = (values: GRNFormValues) => {
    if (values.mode === "po_based") {
      createMutation.mutate(
        {
          purchase_order_id: values.purchase_order_id,
          received_date: new Date(values.received_date).toISOString(),
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
      createMutation.mutate(
        {
          supplier_id: values.supplier_id,
          received_date: new Date(values.received_date).toISOString(),
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
    <PageContainer className="space-y-6">
      <PageHeader
        title="Create Goods Received Note"
        description="Receive a delivery against a Purchase Order or directly from a supplier."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Procurement", href: "/procurement/grns" },
              { label: "GRN", href: "/procurement/grns" },
              { label: "New" },
            ]}
          />
        }
      />

      <GRNForm
        approvedPOs={approvedPOs}
        selectedPO={selectedPO}
        onPOSelect={setSelectedPOId}
        suppliers={suppliers}
        products={products}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </PageContainer>
  );
}
