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
  const releaseQty = form.watch(`items.${index}.quantity`);

  // Find currently selected product in available inventory
  const selectedInventoryItem = React.useMemo(() => {
    return inventoryProducts.find(
      (item) => item.product?.id === productId || item.id === productId
    );
  }, [inventoryProducts, productId]);

  // Update available_quantity and uom when product changes
  React.useEffect(() => {
    if (selectedInventoryItem) {
      const avail = selectedInventoryItem.quantity_on_hand ?? 0;
      const uom =
        selectedInventoryItem.product?.uom_code ||
        selectedInventoryItem.product?.uom_name ||
        "units";
      form.setValue(`items.${index}.available_quantity`, avail, {
        shouldValidate: true,
      });
      form.setValue(`items.${index}.unit_of_measure`, uom, {
        shouldValidate: true,
      });
    }
  }, [selectedInventoryItem, form, index]);

  const availableStock = selectedInventoryItem?.quantity_on_hand ?? 0;
  const isOverStock = Boolean(
    selectedInventoryItem && Number(releaseQty) > availableStock
  );

  const errors = form.formState.errors.items?.[index];

  return (
    <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3 transition-all hover:border-border">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Product selector (cols 1-5) */}
        <div className="md:col-span-5 space-y-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <span>Product</span>
            <span className="text-destructive">*</span>
          </label>

          <Select
            value={productId || ""}
            onValueChange={(val) => {
              form.setValue(`items.${index}.product_id`, val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            disabled={isLoadingProducts}
          >
            <SelectTrigger
              aria-label={`Select product for row ${index + 1}`}
              className={errors?.product_id ? "border-destructive" : ""}
            >
              <SelectValue
                placeholder={
                  isLoadingProducts ? "Loading products..." : "Select product..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {inventoryProducts.map((item) => {
                const pId = item.product?.id || item.id;
                const pName = item.product?.name || "Product";
                const pSku = item.product?.sku || "";
                const stockQty = item.quantity_on_hand ?? 0;
                const isSelectedElsewhere =
                  selectedProductIds.includes(pId) && pId !== productId;

                return (
                  <SelectItem
                    key={item.id}
                    value={pId}
                    disabled={isSelectedElsewhere || stockQty <= 0}
                  >
                    <div className="flex items-center justify-between w-full gap-4 text-xs">
                      <span className="font-medium truncate">
                        {pName} {pSku ? `(${pSku})` : ""}
                      </span>
                      <span
                        className={
                          stockQty > 0
                            ? "text-emerald-600 dark:text-emerald-400 font-mono text-[11px]"
                            : "text-rose-500 font-mono text-[11px]"
                        }
                      >
                        {stockQty} available
                      </span>
                    </div>
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

        {/* Available Stock indicator (cols 6-7) */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            Available Stock
          </label>
          <div className="h-9 flex items-center px-3 rounded-md bg-muted/40 border border-border/50">
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

        {/* Release Quantity (cols 8-9) */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <span>Release Qty</span>
            <span className="text-destructive">*</span>
          </label>

          <Input
            type="number"
            min="1"
            max={availableStock || undefined}
            step="1"
            placeholder="0"
            aria-label={`Release quantity for row ${index + 1}`}
            {...form.register(`items.${index}.quantity`, {
              valueAsNumber: true,
            })}
            className={
              errors?.quantity || isOverStock ? "border-destructive" : ""
            }
          />

          {errors?.quantity && (
            <p className="text-[11px] text-destructive font-medium">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* Unit of Measure (cols 10-11) */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            UOM
          </label>
          <Input
            readOnly
            aria-label={`Unit of measure for row ${index + 1}`}
            {...form.register(`items.${index}.unit_of_measure`)}
            className="bg-muted/40 text-xs"
            placeholder="UOM"
          />
        </div>

        {/* Remove Row Button (col 12) */}
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

      {isOverStock && (
        <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-md font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Selected quantity ({releaseQty}) exceeds available stock (
            {availableStock}).
          </span>
        </div>
      )}
    </div>
  );
}
