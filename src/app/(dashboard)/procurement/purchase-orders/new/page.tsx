"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
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
    return (suppliersData as any).data || [];
  }, [suppliersData]);

  const productsList = React.useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    return (productsData as any).data || [];
  }, [productsData]);

  const handleSubmit = (values: PurchaseOrderFormValues) => {
    createMutation.mutate(
      {
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
      {
        onSuccess: (po) => {
          router.push(`/procurement/purchase-orders/${po.id}`);
        },
      }
    );
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Create Purchase Order"
        description="Issue a new purchase order to a supplier."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Procurement", href: "/procurement/purchase-orders" },
              { label: "Purchase Orders", href: "/procurement/purchase-orders" },
              { label: "New" },
            ]}
          />
        }
      />

      <PurchaseOrderForm
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
        isLoading={createMutation.isPending}
      />
    </PageContainer>
  );
}
