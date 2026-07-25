"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { UomForm } from "./UomForm";
import { useCreateUom, useUpdateUom } from "../../hooks/use-uoms";
import { emptyToNull } from "../../utils";
import type { UnitOfMeasure } from "../../types";
import type { UomFormValues } from "../../schemas";

interface UomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uom?: UnitOfMeasure | null;
}

export function UomFormDialog({ open, onOpenChange, uom }: UomFormDialogProps) {
  const isEditing = !!uom;
  const createMutation = useCreateUom();
  const updateMutation = useUpdateUom(uom?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  async function handleSubmit(values: UomFormValues) {
    const payload = emptyToNull(values) as UomFormValues;
    if (isEditing) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const defaultValues: Partial<UomFormValues> = uom
    ? {
        name: uom.name,
        symbol: uom.symbol,
        description: uom.description ?? "",
        is_active: uom.is_active,
      }
    : undefined!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Unit of Measure" : "New Unit of Measure"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update unit information." : "Add a new unit of measure."}
          </DialogDescription>
        </DialogHeader>
        <UomForm
          key={uom?.id ?? "create"}
          defaultValues={defaultValues}
          editingId={uom?.id}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          error={error}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
