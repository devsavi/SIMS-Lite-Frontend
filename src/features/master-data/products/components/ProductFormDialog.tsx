"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { useCreateProduct, useUpdateProduct } from "../../hooks/use-products";
import { emptyToNull } from "../../utils";
import type { Product } from "../../types";
import type { ProductFormValues } from "../../schemas";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEditing = !!product;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? "");

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  async function handleSubmit(values: ProductFormValues) {
    const payload = {
      ...emptyToNull(values),
      // Description and selling price are hidden from the UI;
      // always send null so the backend receives an explicit value.
      description: null,
      selling_price: null,
    } as unknown as ProductFormValues;
    if (isEditing) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const defaultValues: Partial<ProductFormValues> = product
    ? {
        name: product.name,
        short_description: product.short_description ?? "",
        description: product.description ?? "",
        category_id: product.category?.id ?? null,
        brand_id: product.brand?.id ?? null,
        uom_id: product.uom?.id ?? null,
        supplier_id: product.supplier?.id ?? null,
        cost_price: product.cost_price ?? 0,
        selling_price: product.selling_price ?? 0,
        reorder_level: product.reorder_level ?? 0,
        reorder_quantity: product.reorder_quantity ?? 0,
        is_active: product.is_active,
      }
    : undefined!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update product information."
              : "Add a new product to the catalogue. The SKU will be auto-generated."}
          </DialogDescription>
        </DialogHeader>

        <ProductForm
          key={product?.id ?? "create"}
          defaultValues={defaultValues}
          editingId={product?.id}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          error={error}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
