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
    const payload = emptyToNull(values) as ProductFormValues;
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
        sku: product.sku,
        barcode: product.barcode ?? "",
        description: product.description ?? "",
        category_id: product.category_id ?? null,
        brand_id: product.brand_id ?? null,
        uom_id: product.uom_id ?? null,
        supplier_id: product.supplier_id ?? null,
        min_stock_level: product.min_stock_level,
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
              : "Add a new product to the catalogue."}
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
