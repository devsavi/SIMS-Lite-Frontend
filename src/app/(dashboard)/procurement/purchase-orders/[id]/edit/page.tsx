"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { PurchaseOrderForm } from "@/features/procurement/purchase-orders/components/PurchaseOrderForm";
import {
  usePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import type { PurchaseOrderFormValues } from "@/features/procurement/purchase-orders/schemas/po.schema";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";
import { useProducts } from "@/features/master-data/hooks/use-products";

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: response, isLoading, error } = usePurchaseOrder(id);
  const po = response?.data;
  const updateMutation = useUpdatePurchaseOrder();

  const { data: suppliersData } = useSuppliers();
  const { data: productsData } = useProducts();

  const suppliersList = React.useMemo(() => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    return (suppliersData as any).data || [];
  }, [suppliersData]);

  const productsList = React.useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    return (productsData as any).data || [];
  }, [productsData]);

  const handleSubmit = (values: PurchaseOrderFormValues) => {
    updateMutation.mutate(
      {
        id,
        data: {
          supplier_id: values.supplier_id,
          order_date: new Date(values.order_date).toISOString(),
          expected_delivery_date: new Date(
            values.expected_delivery_date
          ).toISOString(),
          notes: values.notes || undefined,
          terms_conditions: values.terms_conditions || undefined,
          shipping_address: values.shipping_address || undefined,
          items: values.items.map((item) => ({
            product_id: item.product_id,
            quantity_ordered: item.quantity_ordered,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent ?? 0,
            tax_percent: item.tax_percent ?? 0,
            notes: item.notes || undefined,
          })),
        },
      },
      {
        onSuccess: () => {
          router.push(`/procurement/purchase-orders/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-rose-600">
          Purchase Order Not Found
        </h2>
      </div>
    );
  }

  if (po.status !== "DRAFT") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-amber-600">
          Cannot Edit Purchase Order
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Only draft purchase orders can be edited.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Purchase Order
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {po.po_number} — Draft
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      </div>

      <PurchaseOrderForm
        initialData={po}
        suppliers={suppliersList.map((s: any) => ({
          id: s.id,
          name: s.name || s.company_name || s.supplier_name || "",
        }))}
        products={productsList.map((p: any) => ({
          id: p.id,
          name: p.name || p.product_name || "",
          sku: p.sku || "",
          cost_price: p.cost_price ?? p.costPrice,
        }))}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
