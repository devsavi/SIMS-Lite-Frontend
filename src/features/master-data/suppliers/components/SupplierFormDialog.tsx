"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { SupplierForm } from "./SupplierForm";
import { useCreateSupplier, useUpdateSupplier } from "../../hooks/use-suppliers";
import { emptyToNull } from "../../utils";
import type { Supplier } from "../../types";
import type { SupplierFormValues } from "../../schemas";

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: SupplierFormDialogProps) {
  const isEditing = !!supplier;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(supplier?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  async function handleSubmit(values: SupplierFormValues) {
    const cleaned = {
      ...values,
      // Treat the "+94" prefix-only placeholder as empty (same behaviour as a blank field)
      phone: values.phone === "+94" ? "" : values.phone,
      company_phone: values.company_phone === "+94" ? "" : values.company_phone,
    };
    const payload = emptyToNull(cleaned) as SupplierFormValues;
    if (isEditing) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const defaultValues: Partial<SupplierFormValues> = supplier
    ? {
        company_name: supplier.company_name,
        contact_person: supplier.contact_person ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        company_phone: supplier.company_phone ?? "",
        address: supplier.address ?? "",
        city: supplier.city ?? "",
        country: supplier.country ?? "",
        notes: supplier.notes ?? "",
        is_active: supplier.is_active,
      }
    : undefined!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Supplier" : "New Supplier"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update supplier information." : "Add a new supplier to your network."}
          </DialogDescription>
        </DialogHeader>
        <SupplierForm
          key={supplier?.id ?? "create"}
          defaultValues={defaultValues}
          editingId={supplier?.id}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          error={error}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
