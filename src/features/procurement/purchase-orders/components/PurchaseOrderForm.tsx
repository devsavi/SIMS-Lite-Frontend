"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  purchaseOrderSchema,
  type PurchaseOrderFormValues,
} from "../schemas/po.schema";
import type { PurchaseOrder } from "../types";

export interface SupplierOption {
  id: string;
  name: string;
}

export interface ProductOption {
  id: string;
  name: string;
  sku: string;
  costPrice?: number;
}

export interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder;
  suppliers: SupplierOption[];
  products: ProductOption[];
  onSubmit: (values: PurchaseOrderFormValues, isDraft: boolean) => void;
  isLoading?: boolean;
}

export function PurchaseOrderForm({
  initialData,
  suppliers,
  products,
  onSubmit,
  isLoading = false,
}: PurchaseOrderFormProps) {
  const defaultItems = initialData?.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitCost: item.unitCost,
  })) || [{ productId: "", quantity: 1, unitCost: 0 }];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: initialData?.supplierId || "",
      expectedDeliveryDate: initialData?.expectedDeliveryDate || "",
      notes: initialData?.notes || "",
      items: defaultItems,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Calculate line totals and grand total
  const grandTotal = React.useMemo(() => {
    if (!watchedItems) return 0;
    return watchedItems.reduce((acc, item) => {
      const q = Number(item.quantity) || 0;
      const c = Number(item.unitCost) || 0;
      return acc + q * c;
    }, 0);
  }, [watchedItems]);

  const handleProductSelect = (index: number, productId: string) => {
    setValue(`items.${index}.productId`, productId);
    const selectedProd = products.find((p) => p.id === productId);
    if (selectedProd && selectedProd.costPrice !== undefined) {
      setValue(`items.${index}.unitCost`, selectedProd.costPrice);
    }
  };

  const onFormSubmit = (isDraft: boolean) => (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit((values) => {
      onSubmit(values, isDraft);
    })(e);
  };

  return (
    <form className="space-y-6">
      {/* Header Fields */}
      <div className="grid gap-6 rounded-none border p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supplierId">Supplier *</Label>
          <Select
            defaultValue={initialData?.supplierId}
            onValueChange={(val) => setValue("supplierId", val, { shouldValidate: true })}
          >
            <SelectTrigger id="supplierId">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.supplierId && (
            <p className="text-xs text-rose-500">{errors.supplierId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
          <Input
            id="expectedDeliveryDate"
            type="date"
            {...register("expectedDeliveryDate")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes & Instructions</Label>
          <Textarea
            id="notes"
            placeholder="Add internal notes or order details..."
            rows={3}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Order Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}
          >
            + Add Product Line
          </Button>
        </div>

        {errors.items?.root && (
          <p className="text-xs text-rose-500">{errors.items.root.message}</p>
        )}

        <div className="rounded-none border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Product *</TableHead>
                <TableHead className="w-[20%] text-right">Quantity *</TableHead>
                <TableHead className="w-[20%] text-right">Unit Cost ($) *</TableHead>
                <TableHead className="w-[15%] text-right">Line Total ($)</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const qty = Number(watchedItems[index]?.quantity) || 0;
                const cost = Number(watchedItems[index]?.unitCost) || 0;
                const lineTotal = qty * cost;

                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Select
                        defaultValue={field.productId}
                        onValueChange={(val) => handleProductSelect(index, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.items?.[index]?.productId && (
                        <p className="mt-1 text-xs text-rose-500">
                          {errors.items[index]?.productId?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        className="text-right"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-xs text-rose-500">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="text-right"
                        {...register(`items.${index}.unitCost`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.items?.[index]?.unitCost && (
                        <p className="mt-1 text-xs text-rose-500">
                          {errors.items[index]?.unitCost?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${lineTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        ✕
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Grand Total Bar */}
        <div className="flex justify-end rounded-none border bg-muted/40 p-4">
          <div className="text-right">
            <span className="text-sm font-medium text-muted-foreground mr-4">
              Estimated Total Amount:
            </span>
            <span className="text-xl font-bold text-primary">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onFormSubmit(true)}
          disabled={isLoading}
        >
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={onFormSubmit(false)}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Submit PO"}
        </Button>
      </div>
    </form>
  );
}
