"use client";

/**
 * CategoryFormDialog — create/edit dialog wrapping CategoryForm.
 */

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { CategoryForm } from "./CategoryForm";
import { useCreateCategory, useUpdateCategory } from "../../hooks/use-categories";
import { emptyToNull } from "../../utils";
import type { Category } from "../../types";
import type { CategoryFormValues } from "../../schemas";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass to switch into edit mode */
  category?: Category | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const isEditing = !!category;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(category?.id ?? "");

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  async function handleSubmit(values: CategoryFormValues) {
    const payload = emptyToNull(values) as CategoryFormValues;
    if (isEditing) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const defaultValues: Partial<CategoryFormValues> = category
    ? {
        name: category.name,
        description: category.description ?? "",
        parent_id: category.parent_id ?? null,
        is_active: category.is_active,
      }
    : undefined!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update category information."
              : "Add a new product category to the catalogue."}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          key={category?.id ?? "create"}
          defaultValues={defaultValues}
          editingId={category?.id}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          error={error}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
