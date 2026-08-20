"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { useToast } from "@/app/components/ui/use-toast";
import { AlertCircle, ArrowRight, Loader2, SlidersHorizontal } from "lucide-react";
import { stockAdjustmentSchema, type StockAdjustmentFormValues } from "../../schemas";
import {
  useCreateStockAdjustment,
  useSubmitStockAdjustment,
  useApproveStockAdjustment,
} from "../../hooks/use-inventory";
import {
  calculateNewQuantity,
  isNegativeStockViolation,
  formatQuantity,
} from "../../utils/inventory-utils";
import type { InventoryItem, StockAdjustmentType } from "../../types";

export interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItem: InventoryItem | null;
  onSuccess?: () => void;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  inventoryItem,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateStockAdjustment();
  const submitMutation = useSubmitStockAdjustment();
  const approveMutation = useApproveStockAdjustment();

  const [serverError, setServerError] = React.useState<string | null>(null);

  const currentQty = inventoryItem?.quantity_on_hand ?? 0;
  const productId = inventoryItem?.product?.id ?? inventoryItem?.id ?? "";
  const unitCost =
    inventoryItem?.average_cost ?? (inventoryItem?.product?.cost_price as number | null) ?? 0;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      adjustment_type: "INCREASE",
      reason: "",
      notes: "",
      items: [
        {
          product_id: productId,
          quantity_adjusted: 1,
          unit_cost: unitCost,
          notes: "",
        },
      ],
    },
  });

  // Reset form whenever the dialog opens for a new item
  React.useEffect(() => {
    if (open && inventoryItem) {
      reset({
        adjustment_type: "INCREASE",
        reason: "",
        notes: "",
        items: [
          {
            product_id: productId,
            quantity_adjusted: 1,
            unit_cost: unitCost,
            notes: "",
          },
        ],
      });
      setServerError(null);
    }
  }, [open, inventoryItem, productId, unitCost, reset]);

  const watchedAdjustmentType = useWatch({
    control,
    name: "adjustment_type",
  }) as StockAdjustmentType;

  const watchedItems = useWatch({ control, name: "items" });
  const adjustedQty = Number(watchedItems?.[0]?.quantity_adjusted) || 0;

  const newQtyPreview = calculateNewQuantity(
    currentQty,
    watchedAdjustmentType,
    adjustedQty
  );

  const isNegativeViolation = isNegativeStockViolation(
    currentQty,
    watchedAdjustmentType,
    adjustedQty
  );

  const isBusy =
    isSubmitting ||
    createMutation.isPending ||
    submitMutation.isPending ||
    approveMutation.isPending;

  const onSubmit = async (values: StockAdjustmentFormValues) => {
    if (!inventoryItem || !productId) return;
    setServerError(null);

    if (isNegativeViolation) {
      setServerError(
        `Insufficient stock. Current quantity is ${formatQuantity(currentQty)}, ` +
          `cannot decrease by ${formatQuantity(adjustedQty)}.`
      );
      return;
    }

    try {
      // 1. Create draft
      const created = await createMutation.mutateAsync({
        adjustment_type: values.adjustment_type,
        reason: values.reason,
        notes: values.notes ?? null,
        items: [
          {
            product_id: productId,
            quantity_adjusted: Number(values.items[0].quantity_adjusted),
            unit_cost: unitCost,
            notes: values.items[0].notes ?? null,
          },
        ],
      });

      // 2. Submit draft
      const submitted = await submitMutation.mutateAsync(created.id);

      // 3. Approve immediately (auto-approve flow for quick adjustments)
      await approveMutation.mutateAsync(submitted.id);

      toast({
        title: "Stock Adjusted Successfully",
        description: `Adjusted ${inventoryItem.product?.name ?? "product"} from ${formatQuantity(currentQty)} → ${formatQuantity(newQtyPreview)}.`,
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        (err as { message?: string })?.message ??
        "Failed to record stock adjustment.";
      setServerError(errorMsg);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setServerError(null);
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Quick Stock Adjustment
          </DialogTitle>
          <DialogDescription>
            Perform a stock adjustment for{" "}
            <span className="font-semibold text-foreground">
              {inventoryItem?.product?.name ?? "selected product"}
            </span>{" "}
            (SKU: {inventoryItem?.product?.sku ?? "N/A"}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Current → New preview */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-none border border-border text-center items-center">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Current Stock
              </div>
              <div className="text-lg font-bold text-foreground">
                {formatQuantity(currentQty)}
              </div>
            </div>

            <div className="flex justify-center text-muted-foreground">
              <ArrowRight className="h-5 w-5" />
            </div>

            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                New Stock Preview
              </div>
              <div
                className={`text-lg font-bold ${
                  newQtyPreview < 0
                    ? "text-destructive"
                    : newQtyPreview === 0
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {formatQuantity(newQtyPreview)}
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-1.5">
            <Label htmlFor="adjustment-type" className="text-xs font-semibold">
              Adjustment Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedAdjustmentType}
              onValueChange={(val) =>
                setValue("adjustment_type", val as StockAdjustmentType, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="adjustment-type">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCREASE">Stock Increase (+)</SelectItem>
                <SelectItem value="DECREASE">Stock Decrease (-)</SelectItem>
                <SelectItem value="RECOUNT">Recount (set exact quantity)</SelectItem>
              </SelectContent>
            </Select>
            {errors.adjustment_type && (
              <p className="text-xs text-destructive">
                {errors.adjustment_type.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="quantity" className="text-xs font-semibold">
              {watchedAdjustmentType === "RECOUNT" ? "New Quantity" : "Quantity"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="any"
              {...register("items.0.quantity_adjusted", { valueAsNumber: true })}
              placeholder="e.g. 5"
            />
            {errors.items?.[0]?.quantity_adjusted && (
              <p className="text-xs text-destructive">
                {errors.items[0].quantity_adjusted?.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-semibold">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reason"
              {...register("reason")}
              placeholder="e.g. Physical count discrepancy, spoilage or expiry"
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              rows={2}
              {...register("notes")}
              placeholder="Additional internal details, batch number or audit remarks..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isBusy || isNegativeViolation}
              className="gap-2"
            >
              {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
