"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GRNForm } from "@/features/procurement/grns/components/GRNForm";
import {
  useGRN,
  useUpdateGRN,
} from "@/features/procurement/grns/hooks/use-grns";
import { useSuppliers } from "@/features/master-data/hooks/use-suppliers";
import { useProducts } from "@/features/master-data/hooks/use-products";
import type { GRNFormValues } from "@/features/procurement/grns/schemas/grn.schema";

export default function EditGRNPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: grnResponse, isLoading, error } = useGRN(id);
  const grn = grnResponse?.data;

  const updateMutation = useUpdateGRN();

  // Fetch suppliers and products for the direct (PO-less) mode
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
      updateMutation.mutate(
        {
          id,
          data: {
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
        },
        {
          onSuccess: () => {
            router.push(`/procurement/grns/${id}`);
          },
        }
      );
    } else {
      // Direct (PO-less): omit po_item_id from items
      updateMutation.mutate(
        {
          id,
          data: {
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
        },
        {
          onSuccess: () => {
            router.push(`/procurement/grns/${id}`);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !grn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-rose-600">GRN Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested Goods Received Note could not be loaded.
        </p>
      </div>
    );
  }

  if (grn.status !== "DRAFT") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-amber-600">
          GRN Cannot Be Edited
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Only draft GRNs can be edited. This GRN is{" "}
          <strong>{grn.status}</strong>.
        </p>
      </div>
    );
  }

  // Detect mode from existing GRN data
  const isPOBased = Boolean(grn.purchase_order_id);

  const defaultValues: Partial<GRNFormValues> = isPOBased
    ? {
        mode: "po_based",
        purchase_order_id: grn.purchase_order_id!,
        received_date: grn.received_date
          ? grn.received_date.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        delivery_note_number: grn.delivery_note_number || "",
        notes: grn.notes || "",
        items: grn.items.map((item) => ({
          po_item_id: item.po_item_id ?? "",
          product_id: item.product?.id ?? "",
          quantity_received: item.quantity_received,
          unit_cost: item.unit_cost,
          notes: item.notes || "",
        })),
      }
    : {
        mode: "direct",
        supplier_id: grn.supplier_id ?? "",
        received_date: grn.received_date
          ? grn.received_date.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        delivery_note_number: grn.delivery_note_number || "",
        notes: grn.notes || "",
        items: grn.items.map((item) => ({
          product_id: item.product?.id ?? "",
          quantity_received: item.quantity_received,
          unit_cost: item.unit_cost,
          notes: item.notes || "",
        })),
      };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit GRN — {grn.grn_number}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update the draft Goods Received Note before submitting.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      </div>

      <GRNForm
        approvedPOs={[]}
        suppliers={suppliers}
        products={products}
        defaultValues={defaultValues}
        lockMode
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
