"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PurchaseOrderForm } from "@/features/procurement/purchase-orders/components/PurchaseOrderForm";
import { useCreatePurchaseOrder } from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import type { PurchaseOrderFormValues } from "@/features/procurement/purchase-orders/schemas/po.schema";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";
import { useProducts } from "@/features/master-data/hooks/use-products";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const createMutation = useCreatePurchaseOrder();

  const { data: suppliersData } = useSuppliers();
  const { data: productsData } = useProducts();

  const suppliersList = React.useMemo(() => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    return suppliersData.data || [];
  }, [suppliersData]);

  const productsList = React.useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    return productsData.data || [];
  }, [productsData]);

  const handleSubmit = (values: PurchaseOrderFormValues, isDraft: boolean) => {
    createMutation.mutate(
      {
        supplierId: values.supplierId,
        expectedDeliveryDate: values.expectedDeliveryDate || null,
        notes: values.notes || null,
        items: values.items,
        isDraft,
      },
      {
        onSuccess: () => {
          router.push("/procurement/purchase-orders");
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Purchase Order</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Draft or issue a new purchase order to a supplier.
        </p>
      </div>

      <PurchaseOrderForm
        suppliers={suppliersList.map((s: any) => ({ id: s.id, name: s.name || s.company_name || s.supplier_name || "" }))}
        products={productsList.map((p: any) => ({ id: p.id, name: p.name || p.product_name || "", sku: p.sku || "" }))}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
