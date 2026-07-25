"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { BrandForm } from "./BrandForm";
import { useCreateBrand, useUpdateBrand } from "../../hooks/use-brands";
import { emptyToNull } from "../../utils";
import type { Brand } from "../../types";
import type { BrandFormValues } from "../../schemas";

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
}

export function BrandFormDialog({ open, onOpenChange, brand }: BrandFormDialogProps) {
  const isEditing = !!brand;
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand(brand?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  async function handleSubmit(values: BrandFormValues) {
    const payload = emptyToNull(values) as BrandFormValues;
    if (isEditing) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const defaultValues: Partial<BrandFormValues> = brand
    ? {
        name: brand.name,
        description: brand.description ?? "",
        logo_url: brand.logo_url ?? "",
        website_url: brand.website_url ?? "",
        is_active: brand.is_active,
      }
    : undefined!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Brand" : "New Brand"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update brand information." : "Add a new brand to the catalogue."}
          </DialogDescription>
        </DialogHeader>
        <BrandForm
          key={brand?.id ?? "create"}
          defaultValues={defaultValues}
          editingId={brand?.id}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          error={error}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
