import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Send, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { UnsavedChangesDialog } from "@/components/common/confirmation-dialog";
import { ReleaseItemRow } from "../release-items/ReleaseItemRow";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory";
import {
  stockReleaseFormSchema,
  type StockReleaseFormValues,
} from "../../schemas/stock-release-schema";
import type { StockRelease, CreateStockReleasePayload } from "../../types/stock-release-types";

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
  const router = useRouter();
  const [unsavedDialogOpen, setUnsavedDialogOpen] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null);

  // Fetch store inventory for live stock levels and product selector
  const { data: inventoryResponse, isLoading: isLoadingInventory } = useInventoryList({
    page: 1,
    size: 200, // Fetch top active items for selector
  });

  const inventoryProducts = inventoryResponse?.data ?? [];

  const defaultValues: StockReleaseFormValues = {
    release_date: initialData?.release_date
      ? new Date(initialData.release_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: initialData?.notes ?? "",
    items: initialData?.items?.length
      ? initialData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          available_quantity: item.available_quantity ?? 0,
          unit_of_measure: item.unit_of_measure || "units",
          notes: item.notes ?? "",
        }))
      : [
          {
            product_id: "",
            quantity: 1,
            available_quantity: 0,
            unit_of_measure: "units",
            notes: "",
          },
        ],
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

  const isDirty = form.formState.isDirty;
  const items = form.watch("items");

  // Track selected products to prevent duplicate selection
  const selectedProductIds = items.map((i) => i.product_id).filter(Boolean);

  // Calculate live total quantity
  const totalQuantity = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const handleFormSubmit = async (values: StockReleaseFormValues, submitDirectly = false) => {
    const payload: CreateStockReleasePayload = {
      release_date: values.release_date,
      notes: values.notes || undefined,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit_of_measure: item.unit_of_measure,
        notes: item.notes || undefined,
      })),
    };

    await onSubmit(payload, submitDirectly);
    form.reset(values); // reset dirty state after submit
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setPendingNavigation("/stock-release");
      setUnsavedDialogOpen(true);
    } else {
      router.push("/stock-release");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit((values) => handleFormSubmit(values, false))}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header card: General Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {mode === "create" ? "Create Stock Release" : "Edit Draft Release"}
              </CardTitle>
              <CardDescription className="text-xs">
                Specify release details and select items to be released from inventory stock.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelClick}
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to List</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Total Quantity summary preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Release Summary
              </label>
              <div className="h-9 flex items-center justify-between px-3 rounded-md bg-muted/40 border text-xs">
                <span className="text-muted-foreground">Total Line Items: {fields.length}</span>
                <span className="font-semibold text-foreground font-mono">
                  Total Released Qty: {totalQuantity}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Notes / Reason</label>
            <Textarea
              placeholder="Add optional notes or reference info for this stock release request..."
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
              onClick={() =>
                append({
                  product_id: "",
                  quantity: 1,
                  available_quantity: 0,
                  unit_of_measure: "units",
                  notes: "",
                })
              }
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Add Item</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.formState.errors.items?.root && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium flex items-center gap-2">
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

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                append({
                  product_id: "",
                  quantity: 1,
                  available_quantity: 0,
                  unit_of_measure: "units",
                  notes: "",
                })
              }
              className="gap-1.5 text-xs text-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Item</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelClick}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          {/* Save Draft */}
          <Button
            type="submit"
            variant="outline"
            disabled={isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? "Saving..." : "Save Draft"}</span>
          </Button>

          {/* Save & Submit */}
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
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onOpenChange={setUnsavedDialogOpen}
        onDiscard={() => {
          setUnsavedDialogOpen(false);
          if (pendingNavigation) router.push(pendingNavigation);
        }}
        onSave={form.handleSubmit((values) => handleFormSubmit(values, false))}
      />
    </form>
  );
}
