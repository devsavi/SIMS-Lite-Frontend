"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { ReleaseItemRow } from "../release-items/ReleaseItemRow";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory";
import { PURPOSE_LABELS } from "../../constants/stock-release-constants";
import {
  stockReleaseFormSchema,
  type StockReleaseFormValues,
} from "../../schemas/stock-release-schema";
import type { StockRelease, CreateStockReleasePayload, StockReleasePurpose } from "../../types/stock-release-types";

export interface StockReleaseFormProps {
  initialData?: StockRelease;
  onSubmit: (payload: CreateStockReleasePayload, autoSubmit?: boolean) => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function StockReleaseForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create",
}: StockReleaseFormProps) {
  // Fetch store inventory for product selection
  const { data: inventoryResponse, isLoading: isLoadingInventory } = useInventoryList({
    page: 1,
    size: 200,
  });

  const inventoryProducts = inventoryResponse?.data ?? [];

  const defaultValues: StockReleaseFormValues = {
    purpose: (initialData?.purpose ?? "INTERNAL_USE") as StockReleasePurpose,
    release_date: initialData?.release_date
      ? new Date(initialData.release_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: initialData?.notes ?? "",
    reference_document: initialData?.reference_document ?? "",
    items: initialData?.items?.length
      ? initialData.items.map((item) => ({
          product_id: item.product?.id ?? item.product_id ?? "",
          quantity_requested: item.quantity_requested,
          notes: item.notes ?? "",
        }))
      : [{ product_id: "", quantity_requested: 1, notes: "" }],
  };

  const form = useForm<StockReleaseFormValues>({
    resolver: zodResolver(stockReleaseFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");

  // Track selected products to prevent duplicate selection
  const selectedProductIds = items.map((i) => i.product_id).filter(Boolean);

  // Live total quantity
  const totalQuantity = items.reduce(
    (sum, item) => sum + (Number(item.quantity_requested) || 0),
    0
  );

  const handleFormSubmit = async (values: StockReleaseFormValues, submitDirectly = false) => {
    const payload: CreateStockReleasePayload = {
      purpose: values.purpose as StockReleasePurpose,
      release_date: values.release_date,
      notes: values.notes || undefined,
      reference_document: values.reference_document || undefined,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        quantity_requested: Number(item.quantity_requested),
        notes: item.notes || undefined,
      })),
    };

    await onSubmit(payload, submitDirectly);
    form.reset(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit((values) => handleFormSubmit(values, false))}
      className="space-y-6 w-full max-w-5xl mx-auto"
    >
      {/* General Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {mode === "create" ? "Create Stock Release" : "Edit Draft Release"}
          </CardTitle>
          <CardDescription className="text-xs">
            Specify release details and select items to be released from inventory stock.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Purpose</span>
                <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.watch("purpose") ?? ""}
                onValueChange={(val) =>
                  form.setValue("purpose", val as StockReleasePurpose, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger
                  aria-label="Select release purpose"
                  className={form.formState.errors.purpose ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select purpose..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PURPOSE_LABELS) as StockReleasePurpose[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PURPOSE_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.purpose && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.purpose.message}
                </p>
              )}
            </div>

            {/* Release Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Release Date</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                aria-label="Release Date"
                {...form.register("release_date")}
                className={form.formState.errors.release_date ? "border-destructive" : ""}
              />
              {form.formState.errors.release_date && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.release_date.message}
                </p>
              )}
            </div>

            {/* Reference Document */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Reference Document
                <span className="font-normal text-muted-foreground"> (optional)</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. WO-2026-001"
                aria-label="Reference document"
                {...form.register("reference_document")}
                className="text-xs"
              />
              {form.formState.errors.reference_document && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.reference_document.message}
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Release Summary
              </label>
              <div className="h-9 flex items-center justify-between px-3 rounded-none bg-muted/40 border text-xs">
                <span className="text-muted-foreground">Items: {fields.length}</span>
                <span className="font-semibold text-foreground font-mono">
                  Total Qty: {totalQuantity}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Notes</label>
            <Textarea
              placeholder="Add optional notes for this stock release request..."
              rows={3}
              {...form.register("notes")}
              className="text-xs"
            />
            {form.formState.errors.notes && (
              <p className="text-xs text-destructive font-medium">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Release Items</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({fields.length} {fields.length === 1 ? "item" : "items"})
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Select products and enter quantities to release. Quantities are validated against available stock.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ product_id: "", quantity_requested: 1, notes: "" })}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Add Item</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.formState.errors.items?.root && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-none font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{form.formState.errors.items.root.message}</span>
            </div>
          )}

          {fields.map((field, index) => (
            <ReleaseItemRow
              key={field.id}
              index={index}
              form={form}
              inventoryProducts={inventoryProducts}
              isLoadingProducts={isLoadingInventory}
              selectedProductIds={selectedProductIds}
              onRemove={remove}
              canRemove={fields.length > 1}
            />
          ))}


        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="outline"
          disabled={isLoading}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? "Saving..." : "Save Draft"}</span>
        </Button>

        <Button
          type="button"
          onClick={form.handleSubmit((values) => handleFormSubmit(values, true))}
          disabled={isLoading}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="h-4 w-4" />
          <span>{isLoading ? "Submitting..." : "Submit for Approval"}</span>
        </Button>
      </div>
    </form>
  );
}
