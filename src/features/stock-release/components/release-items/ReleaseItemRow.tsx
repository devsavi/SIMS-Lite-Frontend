"use client";

import * as React from "react";
import { Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import type { InventoryItem } from "@/features/inventory/types";
import type { UseFormReturn } from "react-hook-form";
import type { StockReleaseFormValues } from "../../schemas/stock-release-schema";

export interface ReleaseItemRowProps {
  index: number;
  form: UseFormReturn<StockReleaseFormValues>;
  inventoryProducts: InventoryItem[];
  isLoadingProducts?: boolean;
  selectedProductIds: string[];
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function ReleaseItemRow({
  index,
  form,
  inventoryProducts,
  isLoadingProducts = false,
  selectedProductIds,
  onRemove,
  canRemove,
}: ReleaseItemRowProps) {
  const productId = form.watch(`items.${index}.product_id`);
  const requestedQty = form.watch(`items.${index}.quantity_requested`);

  // Find currently selected product in inventory
  const selectedInventoryItem = React.useMemo(
    () =>
      inventoryProducts.find(
        (item) => item.product?.id === productId || item.id === productId
      ),
    [inventoryProducts, productId]
  );

  const availableStock = selectedInventoryItem?.quantity_on_hand ?? 0;
  const isOverStock = Boolean(
    selectedInventoryItem && Number(requestedQty) > availableStock
  );

  const errors = form.formState.errors.items?.[index];

  return (
    <div className="p-4 rounded-none border border-border/80 bg-card/60 space-y-3 transition-all hover:border-border">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start min-w-0">
        {/* Product selector (cols 1-6) */}
        <div className="md:col-span-6 min-w-0 space-y-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <span>Product</span>
            <span className="text-destructive">*</span>
          </label>

          <Select
            value={productId || ""}
            onValueChange={(val) =>
              form.setValue(`items.${index}.product_id`, val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            disabled={isLoadingProducts}
          >
            <SelectTrigger
              aria-label={`Select product for row ${index + 1}`}
              className={`w-full min-w-0 ${errors?.product_id ? "border-destructive" : ""}`}
            >
              <SelectValue
                placeholder={
                  isLoadingProducts ? "Loading products..." : "Select product..."
                }
              />
            </SelectTrigger>
            {/* SelectContent renders in a portal so its width won't affect the form layout */}
            <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)]">
              {inventoryProducts.map((item) => {
                const pId = item.product?.id || item.id;
                const pName = item.product?.name || "Product";
                const pSku = item.product?.sku || "";
                const stockQty = item.quantity_on_hand ?? 0;
                const isSelectedElsewhere =
                  selectedProductIds.includes(pId) && pId !== productId;
                // textValue is what the trigger shows after selection — plain string, no layout
                const triggerLabel = pSku ? `${pName} (${pSku})` : pName;

                return (
                  <SelectItem
                    key={item.id}
                    value={pId}
                    textValue={triggerLabel}
                    disabled={isSelectedElsewhere || stockQty <= 0}
                  >
                    {/* Rich row shown inside the dropdown only */}
                    <span className="flex items-center justify-between gap-3 text-xs w-full pr-1">
                      <span className="truncate font-medium">{triggerLabel}</span>
                      <span
                        className={`shrink-0 font-mono text-[11px] ${
                          stockQty > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-500"
                        }`}
                      >
                        {stockQty} avail
                      </span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {errors?.product_id && (
            <p className="text-[11px] text-destructive font-medium">
              {errors.product_id.message}
            </p>
          )}
        </div>

        {/* Available stock indicator (cols 7-9) */}
        <div className="md:col-span-3 min-w-0 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            Available Stock
          </label>
          <div className="h-9 flex items-center px-3 rounded-none bg-muted/40 border border-border/50">
            {selectedInventoryItem ? (
              <Badge
                variant={availableStock > 0 ? "outline" : "destructive"}
                className="font-mono text-xs gap-1"
              >
                {availableStock > 0 ? (
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-rose-500" />
                )}
                <span>{availableStock}</span>
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        </div>

        {/* Request quantity (cols 10-11) */}
        <div className="md:col-span-2 min-w-0 space-y-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <span>Qty</span>
            <span className="text-destructive">*</span>
          </label>

          <Input
            type="number"
            min="1"
            max={availableStock || undefined}
            step="1"
            placeholder="0"
            aria-label={`Quantity requested for row ${index + 1}`}
            {...form.register(`items.${index}.quantity_requested`, {
              valueAsNumber: true,
            })}
            className={
              errors?.quantity_requested || isOverStock
                ? "border-destructive"
                : ""
            }
          />

          {errors?.quantity_requested && (
            <p className="text-[11px] text-destructive font-medium">
              {errors.quantity_requested.message}
            </p>
          )}
        </div>

        {/* Remove button (col 12) */}
        <div className="md:col-span-1 flex items-end justify-end h-9 md:h-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            className="text-muted-foreground hover:text-destructive transition-colors h-9 w-9"
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notes for this line item */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Item Notes
          <span className="font-normal text-muted-foreground/70"> (optional)</span>
        </label>
        <Input
          type="text"
          placeholder="Notes for this item..."
          aria-label={`Notes for row ${index + 1}`}
          {...form.register(`items.${index}.notes`)}
          className="text-xs"
        />
      </div>

      {isOverStock && (
        <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-none font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Requested quantity ({requestedQty}) exceeds available stock (
            {availableStock}).
          </span>
        </div>
      )}
    </div>
  );
}
