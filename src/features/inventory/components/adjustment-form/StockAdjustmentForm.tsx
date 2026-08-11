"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Send, AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/app/components/ui/label";
import { useInventoryList } from "../../hooks/use-inventory";
import { stockAdjustmentSchema, type StockAdjustmentFormValues } from "../../schemas";
import type { StockAdjustment, StockAdjustmentCreatePayload, StockAdjustmentType } from "../../types";

export interface StockAdjustmentFormProps {
  initialData?: StockAdjustment;
  onSubmit: (payload: StockAdjustmentCreatePayload, autoSubmit?: boolean) => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function StockAdjustmentForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create",
}: StockAdjustmentFormProps) {
  const router = useRouter();

  const { data: inventoryResponse, isLoading: isLoadingInventory } = useInventoryList({
    page: 1,
    size: 200,
  });
  const inventoryProducts = inventoryResponse?.data ?? [];

  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      adjustment_type: initialData?.adjustment_type ?? "INCREASE",
      reason: initialData?.reason ?? "",
      notes: initialData?.notes ?? "",
      items: initialData?.items?.length
        ? initialData.items.map((item) => ({
            product_id: item.product?.id ?? "",
            quantity_adjusted: item.quantity_adjusted,
            unit_cost: item.unit_cost ?? 0,
            notes: item.notes ?? "",
          }))
        : [{ product_id: "", quantity_adjusted: 1, unit_cost: 0, notes: "" }],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const selectedProductIds = watchedItems.map((i) => i.product_id).filter(Boolean);
  const totalQty = watchedItems.reduce((sum, item) => sum + (Number(item.quantity_adjusted) || 0), 0);

  const handleFormSubmit = async (
    values: StockAdjustmentFormValues,
    autoSubmit = false
  ) => {
    const payload: StockAdjustmentCreatePayload = {
      adjustment_type: values.adjustment_type,
      reason: values.reason,
      notes: values.notes || undefined,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        quantity_adjusted: Number(item.quantity_adjusted),
        unit_cost: Number(item.unit_cost) || 0,
        notes: item.notes || undefined,
      })),
    };
    await onSubmit(payload, autoSubmit);
    form.reset(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit((values) => handleFormSubmit(values, false))}
      className="space-y-6 w-full"
    >
      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {mode === "create" ? "New Stock Adjustment" : "Edit Draft Adjustment"}
              </CardTitle>
              <CardDescription className="text-xs">
                {mode === "create"
                  ? "Create a draft stock adjustment. You can save it or submit for approval immediately."
                  : "Update the draft adjustment details and items below."}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/inventory/adjustments")}
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to List</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adjustment Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Adjustment Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch("adjustment_type")}
                onValueChange={(val) =>
                  form.setValue("adjustment_type", val as StockAdjustmentType, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger aria-label="Adjustment type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCREASE">Increase (+)</SelectItem>
                  <SelectItem value="DECREASE">Decrease (-)</SelectItem>
                  <SelectItem value="RECOUNT">Recount (set quantity)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.adjustment_type && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.adjustment_type.message}
                </p>
              )}
            </div>

            {/* Summary preview */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Summary
              </Label>
              <div className="h-9 flex items-center justify-between px-3 rounded-none bg-muted/40 border text-xs">
                <span className="text-muted-foreground">
                  Line items: {fields.length}
                </span>
                <span className="font-semibold text-foreground font-mono">
                  Total qty: {totalQty}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              {...form.register("reason")}
              placeholder="e.g. Physical count discrepancy, damaged goods found..."
              className={form.formState.errors.reason ? "border-destructive" : ""}
            />
            {form.formState.errors.reason && (
              <p className="text-xs text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              placeholder="Add optional notes or additional context..."
              rows={2}
              {...form.register("notes")}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Adjustment Items</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({fields.length} {fields.length === 1 ? "item" : "items"})
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Select products and enter quantities to adjust.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ product_id: "", quantity_adjusted: 1, unit_cost: 0, notes: "" })
              }
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Add Item</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.formState.errors.items?.root && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-none font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{form.formState.errors.items.root.message}</span>
            </div>
          )}

          {fields.map((field, index) => {
            const selectedProductId = watchedItems[index]?.product_id;
            const selectedInventoryItem = inventoryProducts.find(
              (inv) => inv.product?.id === selectedProductId
            );

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border border-border rounded-none bg-muted/20 items-start"
              >
                {/* Product selector */}
                <div className="md:col-span-4 space-y-1">
                  <Label className="text-xs text-muted-foreground">Product *</Label>
                  <Select
                    value={watchedItems[index]?.product_id ?? ""}
                    onValueChange={(val) => {
                      form.setValue(`items.${index}.product_id`, val, {
                        shouldValidate: true,
                      });
                      // Auto-fill unit cost from inventory average cost
                      const inv = inventoryProducts.find((i) => i.product?.id === val);
                      if (inv) {
                        form.setValue(`items.${index}.unit_cost`, inv.average_cost ?? 0);
                      }
                    }}
                    disabled={isLoadingInventory}
                  >
                    <SelectTrigger aria-label="Select product">
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryProducts.map((inv) => {
                        const prod = inv.product;
                        if (!prod) return null;
                        const isAlreadySelected =
                          selectedProductIds.includes(prod.id) &&
                          watchedItems[index]?.product_id !== prod.id;
                        return (
                          <SelectItem
                            key={prod.id}
                            value={prod.id}
                            disabled={isAlreadySelected}
                          >
                            {prod.name}{" "}
                            <span className="text-muted-foreground text-xs">
                              (SKU: {prod.sku})
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedInventoryItem && (
                    <p className="text-xs text-muted-foreground">
                      On hand:{" "}
                      <span className="font-semibold text-foreground">
                        {selectedInventoryItem.quantity_on_hand}
                      </span>
                    </p>
                  )}
                  {form.formState.errors.items?.[index]?.product_id && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.items[index]?.product_id?.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    step="any"
                    {...form.register(`items.${index}.quantity_adjusted`, {
                      valueAsNumber: true,
                    })}
                    className="text-xs"
                    placeholder="e.g. 5"
                  />
                  {form.formState.errors.items?.[index]?.quantity_adjusted && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.items[index]?.quantity_adjusted?.message}
                    </p>
                  )}
                </div>

                {/* Unit Cost */}
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Unit Cost</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    {...form.register(`items.${index}.unit_cost`, {
                      valueAsNumber: true,
                    })}
                    className="text-xs"
                    placeholder="0.00"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Input
                    {...form.register(`items.${index}.notes`)}
                    className="text-xs"
                    placeholder="Optional..."
                  />
                </div>

                {/* Remove button */}
                <div className="md:col-span-1 flex items-end pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="pt-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                append({ product_id: "", quantity_adjusted: 1, unit_cost: 0, notes: "" })
              }
              className="gap-1.5 text-xs text-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Item</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/inventory/adjustments")}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3">
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
            <span>{isLoading ? "Submitting..." : "Save & Submit"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
