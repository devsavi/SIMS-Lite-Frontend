"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { grnSchema, type GRNFormValues } from "../schemas/grn.schema";
import type { GoodsReceivedNote } from "../types";
import type { PurchaseOrder } from "../../purchase-orders/types";

export interface GRNFormProps {
  approvedPOs: PurchaseOrder[];
  selectedPO?: PurchaseOrder;
  onPOSelect?: (poId: string) => void;
  onSubmit: (values: GRNFormValues, isDraft: boolean) => void;
  isLoading?: boolean;
}

export function GRNForm({
  approvedPOs,
  selectedPO,
  onPOSelect,
  onSubmit,
  isLoading = false,
}: GRNFormProps) {
  const initialItems = React.useMemo(() => {
    if (!selectedPO) return [];
    return selectedPO.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      orderedQuantity: item.quantity,
      receivedQuantity: item.quantity, // Default to full receive
      notes: "",
    }));
  }, [selectedPO]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GRNFormValues>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      purchaseOrderId: selectedPO?.id || "",
      notes: "",
      items: initialItems,
    },
  });

  React.useEffect(() => {
    if (selectedPO) {
      setValue("purchaseOrderId", selectedPO.id);
      setValue(
        "items",
        selectedPO.items.map((item) => ({
          productId: item.productId,
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity,
          notes: "",
        }))
      );
    }
  }, [selectedPO, setValue]);

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const handleReceiveAll = () => {
    if (!selectedPO) return;
    selectedPO.items.forEach((item, index) => {
      setValue(`items.${index}.receivedQuantity`, item.quantity);
    });
  };

  const onFormSubmit = (isDraft: boolean) => (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit((values) => {
      onSubmit(values, isDraft);
    })(e);
  };

  return (
    <form className="space-y-6">
      {/* Header PO Selection */}
      <div className="grid gap-6 rounded-md border p-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="purchaseOrderId">Select Approved Purchase Order *</Label>
          <select
            id="purchaseOrderId"
            value={selectedPO?.id || ""}
            onChange={(e) => onPOSelect?.(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">-- Choose Approved PO --</option>
            {approvedPOs.map((po) => (
              <option key={po.id} value={po.id}>
                {po.poNumber} - {po.supplierName || po.supplierId} (
                {po.items.length} items)
              </option>
            ))}
          </select>
          {errors.purchaseOrderId && (
            <p className="text-xs text-rose-500">
              {errors.purchaseOrderId.message}
            </p>
          )}
        </div>

        {selectedPO && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">Supplier</Label>
              <p className="text-base font-semibold mt-1">
                {selectedPO.supplierName || selectedPO.supplierId}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">PO Status</Label>
              <p className="text-base font-semibold text-emerald-600 mt-1">
                {selectedPO.status}
              </p>
            </div>
          </>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Delivery / Receipt Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add delivery note number, carrier info, or condition upon delivery..."
            rows={3}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Items Section */}
      {selectedPO && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Receive Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReceiveAll}
            >
              Receive All Ordered Quantities
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Product</TableHead>
                  <TableHead className="w-[15%] text-right">Ordered Qty</TableHead>
                  <TableHead className="w-[20%] text-right">Received Qty *</TableHead>
                  <TableHead className="w-[30%]">Item Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const poItem = selectedPO.items[index];
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <p className="font-medium">
                          {poItem?.productName || field.productId}
                        </p>
                        {poItem?.productSku && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {poItem.productSku}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {poItem?.quantity ?? field.orderedQuantity}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          className="text-right"
                          {...register(`items.${index}.receivedQuantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.items?.[index]?.receivedQuantity && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.items[index]?.receivedQuantity?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="e.g. 2 damaged units"
                          {...register(`items.${index}.notes`)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onFormSubmit(true)}
          disabled={isLoading || !selectedPO}
        >
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={onFormSubmit(false)}
          disabled={isLoading || !selectedPO}
        >
          {isLoading ? "Saving..." : "Submit GRN"}
        </Button>
      </div>
    </form>
  );
}
