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
import { MessageSquarePlus, X } from "lucide-react";
import {
  purchaseOrderSchema,
  type PurchaseOrderFormValues,
} from "../schemas/po.schema";
import type { PurchaseOrder } from "../types";
import { formatCurrency } from "@/utils/format";
import { useSystemSettingsStore } from "@/stores/settings.store";

export interface SupplierOption {
  id: string;
  name: string;
}

export interface ProductOption {
  id: string;
  name: string;
  sku: string;
  cost_price?: number;
}

export interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder;
  suppliers: SupplierOption[];
  products: ProductOption[];
  onSubmit: (values: PurchaseOrderFormValues) => void;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Per-row numeric values — kept in plain React state so updates are instant.
// ---------------------------------------------------------------------------
interface RowValues {
  quantity_ordered: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
}

function calcLineTotal(row: RowValues): number {
  const base = row.quantity_ordered * row.unit_price;
  const afterDisc = base - base * (row.discount_percent / 100);
  return afterDisc + afterDisc * (row.tax_percent / 100);
}

function calcTotals(rows: RowValues[]) {
  let subtotal = 0;
  let discountAmount = 0;
  let taxAmount = 0;
  for (const row of rows) {
    const base = row.quantity_ordered * row.unit_price;
    const disc = base * (row.discount_percent / 100);
    const afterDisc = base - disc;
    const tax = afterDisc * (row.tax_percent / 100);
    subtotal += base;
    discountAmount += disc;
    taxAmount += tax;
  }
  return { subtotal, discountAmount, taxAmount, total: subtotal - discountAmount + taxAmount };
}

function todayISO() {
  // Use local date parts to avoid UTC-offset issues (e.g. UTC+5:30 showing yesterday)
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PurchaseOrderForm({
  initialData,
  suppliers,
  products,
  onSubmit,
  isLoading = false,
}: PurchaseOrderFormProps) {
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);

  const defaultItemsForms =
    initialData?.items.map((item) => ({
      product_id: item.product.id,
      quantity_ordered: item.quantity_ordered,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent,
      tax_percent: item.tax_percent,
      notes: item.notes || "",
    })) || [
      {
        product_id: "",
        quantity_ordered: 1,
        unit_price: 0,
        discount_percent: 0,
        tax_percent: 0,
        notes: "",
      },
    ];

  // ── RHF — handles validation & submission only ──
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: initialData?.supplier.id || "",
      order_date: initialData?.order_date
        ? initialData.order_date.split("T")[0]
        : todayISO(),
      expected_delivery_date: initialData?.expected_delivery_date
        ? initialData.expected_delivery_date.split("T")[0]
        : "",
      notes: initialData?.notes || "",
      terms_conditions: initialData?.terms_conditions || "",
      shipping_address: initialData?.shipping_address || "",
      items: defaultItemsForms,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Ensure order_date always reflects today when creating (not editing).
  // This handles the case where the page is navigated to without a full remount.
  React.useEffect(() => {
    if (!initialData) {
      setValue("order_date", todayISO());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Plain React state for numeric values — drives instant UI updates ──
  const [rowValues, setRowValues] = React.useState<RowValues[]>(
    defaultItemsForms.map((i) => ({
      quantity_ordered: i.quantity_ordered,
      unit_price: i.unit_price,
      discount_percent: i.discount_percent,
      tax_percent: i.tax_percent,
    }))
  );

  // ── Expandable notes per row ──
  const [openNotes, setOpenNotes] = React.useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    defaultItemsForms.forEach((item, idx) => {
      if (item.notes && item.notes.trim().length > 0) {
        initial[idx] = true;
      }
    });
    return initial;
  });

  const toggleNoteRow = (index: number) => {
    setOpenNotes((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleRemoveNote = (index: number) => {
    setValue(`items.${index}.notes`, "", { shouldDirty: true });
    setOpenNotes((prev) => ({ ...prev, [index]: false }));
  };

  // Keep rowValues in sync when rows are added / removed
  const appendRow = () => {
    const blank = {
      product_id: "",
      quantity_ordered: 1,
      unit_price: 0,
      discount_percent: 0,
      tax_percent: 0,
      notes: "",
    };
    append(blank);
    setRowValues((prev) => [
      ...prev,
      { quantity_ordered: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 },
    ]);
  };

  const removeRow = (index: number) => {
    remove(index);
    setRowValues((prev) => prev.filter((_, i) => i !== index));
    setOpenNotes((prev) => {
      const next: Record<number, boolean> = {};
      Object.keys(prev).forEach((k) => {
        const keyIdx = Number(k);
        if (keyIdx < index) {
          next[keyIdx] = prev[keyIdx];
        } else if (keyIdx > index) {
          next[keyIdx - 1] = prev[keyIdx];
        }
      });
      return next;
    });
  };

  // Update a single numeric field in both RHF and local state simultaneously
  const handleNumericChange = (
    index: number,
    field: keyof RowValues,
    raw: string
  ) => {
    const num = parseFloat(raw) || 0;
    setValue(`items.${index}.${field}` as any, num);
    setRowValues((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: num };
      return next;
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    setValue(`items.${index}.product_id`, productId);
    const selected = products.find((p) => p.id === productId);
    if (selected?.cost_price !== undefined) {
      const price = selected.cost_price;
      setValue(`items.${index}.unit_price`, price);
      setRowValues((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], unit_price: price };
        return next;
      });
    }
  };

  // Derived — computed directly from rowValues with no memoisation lag
  const totals = calcTotals(rowValues);

  const onFormSubmit = handleSubmit((values) => onSubmit(values));

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      {/* ── Header Fields ── */}
      <div className="grid gap-6 rounded-none border p-4 sm:grid-cols-2">
        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplier_id">Supplier *</Label>
          <Select
            defaultValue={initialData?.supplier.id}
            onValueChange={(val) =>
              setValue("supplier_id", val, { shouldValidate: true })
            }
          >
            <SelectTrigger id="supplier_id">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.supplier_id && (
            <p className="text-xs text-rose-500">{errors.supplier_id.message}</p>
          )}
        </div>

        {/* Order Date */}
        <div className="space-y-2">
          <Label htmlFor="order_date">Order Date *</Label>
          <Input id="order_date" type="date" {...register("order_date")} />
          {errors.order_date && (
            <p className="text-xs text-rose-500">{errors.order_date.message}</p>
          )}
        </div>

        {/* Expected Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="expected_delivery_date">Expected Delivery Date *</Label>
          <Input
            id="expected_delivery_date"
            type="date"
            {...register("expected_delivery_date")}
          />
          {errors.expected_delivery_date && (
            <p className="text-xs text-rose-500">
              {errors.expected_delivery_date.message}
            </p>
          )}
        </div>

        {/* Shipping Address */}
        <div className="space-y-2">
          <Label htmlFor="shipping_address">Shipping Address</Label>
          <Input
            id="shipping_address"
            placeholder="Delivery address..."
            {...register("shipping_address")}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Internal notes or order details..."
            rows={2}
            {...register("notes")}
          />
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="terms_conditions">Terms & Conditions</Label>
          <Textarea
            id="terms_conditions"
            placeholder="Payment terms, delivery conditions..."
            rows={2}
            {...register("terms_conditions")}
          />
        </div>
      </div>

      {/* ── Line Items ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Order Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={appendRow}>
            + Add Item
          </Button>
        </div>

        {errors.items?.root && (
          <p className="text-xs text-rose-500">{errors.items.root.message}</p>
        )}

        <div className="rounded-none border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Product *</TableHead>
                <TableHead className="w-[12%] text-right">Qty *</TableHead>
                <TableHead className="w-[16%] text-right">
                  Unit Price ({baseCurrency}) *
                </TableHead>
                <TableHead className="w-[10%] text-right">Disc %</TableHead>
                <TableHead className="w-[10%] text-right">Tax %</TableHead>
                <TableHead className="w-[14%] text-right">
                  Line Total ({baseCurrency})
                </TableHead>
                <TableHead className="w-[8%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const row = rowValues[index] ?? {
                  quantity_ordered: 0,
                  unit_price: 0,
                  discount_percent: 0,
                  tax_percent: 0,
                };
                const lineTotal = calcLineTotal(row);
                const hasNote = openNotes[index];

                return (
                  <React.Fragment key={field.id}>
                    <TableRow>
                      {/* Product */}
                      <TableCell>
                        <Select
                          defaultValue={field.product_id}
                          onValueChange={(val) => handleProductSelect(index, val)}
                        >
                          <SelectTrigger aria-label={`Select product for row ${index + 1}`}>
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
                        {errors.items?.[index]?.product_id && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.items[index]?.product_id?.message}
                          </p>
                        )}
                        {!hasNote && (
                          <button
                            type="button"
                            onClick={() => toggleNoteRow(index)}
                            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mt-1.5"
                            aria-label={`Add note for item ${index + 1}`}
                          >
                            <MessageSquarePlus className="h-3.5 w-3.5" />
                            <span>Add note</span>
                          </button>
                        )}
                      </TableCell>

                      {/* Quantity */}
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          className="text-right"
                          value={row.quantity_ordered}
                          onChange={(e) =>
                            handleNumericChange(index, "quantity_ordered", e.target.value)
                          }
                        />
                        {errors.items?.[index]?.quantity_ordered && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.items[index]?.quantity_ordered?.message}
                          </p>
                        )}
                      </TableCell>

                      {/* Unit Price */}
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="text-right"
                          value={row.unit_price}
                          onChange={(e) =>
                            handleNumericChange(index, "unit_price", e.target.value)
                          }
                        />
                        {errors.items?.[index]?.unit_price && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.items[index]?.unit_price?.message}
                          </p>
                        )}
                      </TableCell>

                      {/* Discount % */}
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="text-right"
                          value={row.discount_percent}
                          onChange={(e) =>
                            handleNumericChange(index, "discount_percent", e.target.value)
                          }
                        />
                      </TableCell>

                      {/* Tax % */}
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="text-right"
                          value={row.tax_percent}
                          onChange={(e) =>
                            handleNumericChange(index, "tax_percent", e.target.value)
                          }
                        />
                      </TableCell>

                      {/* Line Total — reads from rowValues, updates instantly */}
                      <TableCell className="text-right font-medium">
                        {formatCurrency(lineTotal)}
                      </TableCell>

                      {/* Actions: Remove row */}
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={fields.length === 1}
                          onClick={() => removeRow(index)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                          title="Remove row"
                          aria-label={`Remove row ${index + 1}`}
                        >
                          ✕
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expandable Line Item Note Row — matches Stock Release UI */}
                    {hasNote && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20 border-t-0">
                        <TableCell colSpan={7} className="pt-1 pb-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-muted-foreground">
                                Item Note
                                <span className="font-normal text-muted-foreground/70">
                                  {" "}
                                  (optional)
                                </span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveNote(index)}
                                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                                aria-label={`Remove note for row ${index + 1}`}
                              >
                                <X className="h-3 w-3" />
                                Remove
                              </button>
                            </div>
                            <Input
                              type="text"
                              placeholder="Add a note for this item..."
                              aria-label={`Notes for row ${index + 1}`}
                              {...register(`items.${index}.notes`)}
                              className="text-xs"
                              autoFocus
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* ── Totals — reads from rowValues, no RHF watch involved ── */}
        <div className="flex justify-end rounded-none border bg-muted/40 p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-right">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            <span className="text-muted-foreground">Discount:</span>
            <span className="font-medium text-rose-600">
              -{formatCurrency(totals.discountAmount)}
            </span>
            <span className="text-muted-foreground">Tax:</span>
            <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
            <span className="font-semibold text-base">Total:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
