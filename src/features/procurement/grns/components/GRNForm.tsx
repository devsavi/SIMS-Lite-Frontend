"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
  grnSchemaPOBased,
  grnSchemaDirect,
  type GRNFormValues,
  type GRNFormValuesPOBased,
  type GRNFormValuesDirect,
} from "../schemas/grn.schema";
import type {
  PurchaseOrderListItem,
  PurchaseOrder,
} from "../../purchase-orders/types";

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

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

export interface GRNFormProps {
  // PO-based props
  approvedPOs?: PurchaseOrderListItem[];
  selectedPO?: PurchaseOrder;
  onPOSelect?: (poId: string) => void;

  // Direct (PO-less) props
  suppliers?: SupplierOption[];
  products?: ProductOption[];

  /** Called with the form values when saving. */
  onSubmit: (values: GRNFormValues) => void;
  isLoading?: boolean;
  /** Pre-populated values for edit mode (draft update). */
  defaultValues?: Partial<GRNFormValues>;
  /**
   * When true, locks the mode and hides the mode toggle.
   * Used in edit mode so users can't switch the GRN type after creation.
   */
  lockMode?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowLocalISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

// ---------------------------------------------------------------------------
// PO-Based sub-form
// ---------------------------------------------------------------------------

interface POBasedFormProps {
  approvedPOs: PurchaseOrderListItem[];
  selectedPO?: PurchaseOrder;
  onPOSelect?: (poId: string) => void;
  onSubmit: (values: GRNFormValuesPOBased) => void;
  isLoading: boolean;
  defaultValues?: Partial<GRNFormValuesPOBased>;
  /** In edit mode the PO selector is hidden — the PO is already fixed. */
  hidePOSelector?: boolean;
}

function POBasedForm({
  approvedPOs,
  selectedPO,
  onPOSelect,
  onSubmit,
  isLoading,
  defaultValues,
  hidePOSelector = false,
}: POBasedFormProps) {
  const initialItems = React.useMemo(() => {
    if (defaultValues?.items) return defaultValues.items;
    if (!selectedPO) return [];
    return selectedPO.items.map((item) => ({
      po_item_id: item.id,
      product_id: item.product.id,
      quantity_received: item.quantity_ordered,
      unit_cost: item.unit_price ?? 0,
      notes: "",
    }));
  }, [selectedPO, defaultValues]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GRNFormValuesPOBased>({
    resolver: zodResolver(grnSchemaPOBased),
    defaultValues: {
      mode: "po_based",
      purchase_order_id:
        defaultValues?.purchase_order_id || selectedPO?.id || "",
      received_date: defaultValues?.received_date || nowLocalISO(),
      delivery_note_number: defaultValues?.delivery_note_number || "",
      notes: defaultValues?.notes || "",
      items: initialItems,
    },
  });

  const { fields } = useFieldArray({ control, name: "items" });

  // When the selected PO changes in create mode, refresh items
  React.useEffect(() => {
    if (selectedPO && !hidePOSelector) {
      setValue("purchase_order_id", selectedPO.id);
      setValue(
        "items",
        selectedPO.items.map((item) => ({
          po_item_id: item.id,
          product_id: item.product.id,
          quantity_received: item.quantity_ordered,
          unit_cost: item.unit_price ?? 0,
          notes: "",
        }))
      );
    }
  }, [selectedPO, hidePOSelector, setValue]);

  React.useEffect(() => {
    if (!defaultValues?.received_date) {
      setValue("received_date", nowLocalISO());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReceiveAll = () => {
    if (!selectedPO) return;
    selectedPO.items.forEach((item, index) => {
      setValue(`items.${index}.quantity_received`, item.quantity_ordered);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("mode")} value="po_based" />

      <div className="grid gap-6 rounded-none border p-4 sm:grid-cols-2">
        {/* PO selector — hidden in edit mode */}
        {!hidePOSelector && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="purchase_order_id">
              Select Approved Purchase Order *
            </Label>
            <select
              id="purchase_order_id"
              value={selectedPO?.id || ""}
              onChange={(e) => onPOSelect?.(e.target.value)}
              className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— Choose Approved PO —</option>
              {approvedPOs.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.po_number} — {po.supplier.name} ({po.item_count} items)
                </option>
              ))}
            </select>
            {errors.purchase_order_id && (
              <p className="text-xs text-rose-500">
                {errors.purchase_order_id.message}
              </p>
            )}
          </div>
        )}

        {selectedPO && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">Supplier</Label>
              <p className="text-base font-semibold mt-1">
                {selectedPO.supplier.name}
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

        {/* Received date */}
        <div className="space-y-2">
          <Label htmlFor="received_date">Received Date *</Label>
          <Input
            id="received_date"
            type="datetime-local"
            {...register("received_date")}
          />
          {errors.received_date && (
            <p className="text-xs text-rose-500">
              {errors.received_date.message}
            </p>
          )}
        </div>

        {/* Delivery note number */}
        <div className="space-y-2">
          <Label htmlFor="delivery_note_number">Delivery Note Number</Label>
          <Input
            id="delivery_note_number"
            placeholder="e.g. DN-2026-0001"
            {...register("delivery_note_number")}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Delivery notes, carrier info, condition on arrival..."
            rows={3}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Line items — only shown once a PO is selected (or in edit mode) */}
      {(selectedPO || hidePOSelector) && fields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Received Items</h3>
            {selectedPO && !hidePOSelector && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReceiveAll}
              >
                Receive All Ordered Quantities
              </Button>
            )}
          </div>

          <div className="rounded-none border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Product</TableHead>
                  <TableHead className="w-[18%] text-right">
                    Qty Received *
                  </TableHead>
                  <TableHead className="w-[18%] text-right">Unit Cost</TableHead>
                  <TableHead className="w-[29%]">Item Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const poItem = selectedPO?.items[index];
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <p className="font-medium">
                          {poItem?.product.name || field.product_id}
                        </p>
                        {poItem?.product.sku && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {poItem.product.sku}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          className="text-right"
                          {...register(`items.${index}.quantity_received`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.items?.[index]?.quantity_received && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.items[index]?.quantity_received?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="text-right"
                          {...register(`items.${index}.unit_cost`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.items?.[index]?.unit_cost && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.items[index]?.unit_cost?.message}
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

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isLoading || (!selectedPO && !hidePOSelector)}
        >
          {isLoading ? "Saving..." : "Save GRN"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Direct (PO-less) sub-form
// ---------------------------------------------------------------------------

interface DirectFormProps {
  suppliers: SupplierOption[];
  products: ProductOption[];
  onSubmit: (values: GRNFormValuesDirect) => void;
  isLoading: boolean;
  defaultValues?: Partial<GRNFormValuesDirect>;
}

const EMPTY_DIRECT_ITEM = {
  product_id: "",
  quantity_received: 1,
  unit_cost: 0,
  notes: "",
};

function DirectForm({
  suppliers,
  products,
  onSubmit,
  isLoading,
  defaultValues,
}: DirectFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GRNFormValuesDirect>({
    resolver: zodResolver(grnSchemaDirect),
    defaultValues: {
      mode: "direct",
      supplier_id: defaultValues?.supplier_id || "",
      received_date: defaultValues?.received_date || nowLocalISO(),
      delivery_note_number: defaultValues?.delivery_note_number || "",
      notes: defaultValues?.notes || "",
      items: defaultValues?.items?.length
        ? defaultValues.items
        : [EMPTY_DIRECT_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  React.useEffect(() => {
    if (!defaultValues?.received_date) {
      setValue("received_date", nowLocalISO());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = watch("items");

  const handleProductSelect = (index: number, productId: string) => {
    setValue(`items.${index}.product_id`, productId, { shouldValidate: true });
    const selected = products.find((p) => p.id === productId);
    if (selected?.cost_price !== undefined) {
      setValue(`items.${index}.unit_cost`, selected.cost_price, {
        shouldValidate: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("mode")} value="direct" />

      <div className="grid gap-6 rounded-none border p-4 sm:grid-cols-2">
        {/* Supplier selector */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="supplier_id">Supplier *</Label>
          <Select
            defaultValue={defaultValues?.supplier_id || ""}
            onValueChange={(val) =>
              setValue("supplier_id", val, { shouldValidate: true })
            }
          >
            <SelectTrigger id="supplier_id">
              <SelectValue placeholder="— Select supplier —" />
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

        {/* Received date */}
        <div className="space-y-2">
          <Label htmlFor="received_date_direct">Received Date *</Label>
          <Input
            id="received_date_direct"
            type="datetime-local"
            {...register("received_date")}
          />
          {errors.received_date && (
            <p className="text-xs text-rose-500">
              {errors.received_date.message}
            </p>
          )}
        </div>

        {/* Delivery note number */}
        <div className="space-y-2">
          <Label htmlFor="delivery_note_number_direct">
            Delivery Note Number
          </Label>
          <Input
            id="delivery_note_number_direct"
            placeholder="e.g. DN-2026-0001"
            {...register("delivery_note_number")}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes_direct">Notes</Label>
          <Textarea
            id="notes_direct"
            placeholder="Delivery notes, carrier info, condition on arrival..."
            rows={3}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Line items — freely editable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Received Items
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({fields.length})
            </span>
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ ...EMPTY_DIRECT_ITEM })}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {errors.items?.root && (
          <p className="text-xs text-rose-500">{errors.items.root.message}</p>
        )}

        <div className="rounded-none border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Product *</TableHead>
                <TableHead className="w-[18%] text-right">
                  Qty Received *
                </TableHead>
                <TableHead className="w-[18%] text-right">Unit Cost *</TableHead>
                <TableHead className="w-[22%]">Item Notes</TableHead>
                <TableHead className="w-[7%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  {/* Product selector */}
                  <TableCell>
                    <Select
                      value={items[index]?.product_id || ""}
                      onValueChange={(val) => handleProductSelect(index, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}{" "}
                            <span className="text-muted-foreground">
                              ({p.sku})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.product_id && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.items[index]?.product_id?.message}
                      </p>
                    )}
                  </TableCell>

                  {/* Qty received */}
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      className="text-right"
                      {...register(`items.${index}.quantity_received`, {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.items?.[index]?.quantity_received && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.items[index]?.quantity_received?.message}
                      </p>
                    )}
                  </TableCell>

                  {/* Unit cost */}
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="text-right"
                      {...register(`items.${index}.unit_cost`, {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.items?.[index]?.unit_cost && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.items[index]?.unit_cost?.message}
                      </p>
                    )}
                  </TableCell>

                  {/* Notes */}
                  <TableCell>
                    <Input
                      placeholder="Optional note"
                      {...register(`items.${index}.notes`)}
                    />
                  </TableCell>

                  {/* Remove row */}
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ ...EMPTY_DIRECT_ITEM })}
            className="text-primary gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            Add Another Item
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save GRN"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Mode toggle
// ---------------------------------------------------------------------------

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "po_based" | "direct";
  onChange: (mode: "po_based" | "direct") => void;
}) {
  return (
    <div
      className="inline-flex rounded-none border border-input bg-background p-0.5"
      role="radiogroup"
      aria-label="GRN type"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === "po_based"}
        onClick={() => onChange("po_based")}
        className={`px-4 py-1.5 text-sm font-medium rounded-none transition-colors ${
          mode === "po_based"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        With Purchase Order
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "direct"}
        onClick={() => onChange("direct")}
        className={`px-4 py-1.5 text-sm font-medium rounded-none transition-colors ${
          mode === "direct"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Without Purchase Order
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Outer GRNForm — orchestrates mode toggle and delegates to sub-forms
// ---------------------------------------------------------------------------

export function GRNForm({
  approvedPOs = [],
  selectedPO,
  onPOSelect,
  suppliers = [],
  products = [],
  onSubmit,
  isLoading = false,
  defaultValues,
  lockMode = false,
}: GRNFormProps) {
  const initialMode =
    defaultValues?.mode === "direct" ? "direct" : "po_based";

  const [mode, setMode] = React.useState<"po_based" | "direct">(initialMode);

  const handleModeChange = (next: "po_based" | "direct") => {
    if (lockMode) return;
    setMode(next);
  };

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Receipt Type
        </p>
        {lockMode ? (
          <div className="flex items-center gap-2">
            <span
              className={
                mode === "po_based"
                  ? "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border bg-[#DCEBFC] text-[#1D63C4] border-[#B4D5F8] dark:bg-[rgba(96,165,250,0.15)] dark:text-[#60A5FA] dark:border-[rgba(96,165,250,0.4)]"
                  : "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border bg-[#EAE1FB] text-[#6D28D9] border-[#D3C0F5] dark:bg-[rgba(167,139,250,0.15)] dark:text-[#A78BFA] dark:border-[rgba(167,139,250,0.4)]"
              }
            >
              {mode === "po_based" ? "PO-Based Receipt" : "Direct Receipt"}
            </span>
            <span className="text-xs text-muted-foreground">
              Receipt type cannot be changed after creation.
            </span>
          </div>
        ) : (
          <ModeToggle mode={mode} onChange={handleModeChange} />
        )}
      </div>

      {/* Sub-form — rendered by mode */}
      {mode === "po_based" ? (
        <POBasedForm
          key="po_based"
          approvedPOs={approvedPOs}
          selectedPO={selectedPO}
          onPOSelect={onPOSelect}
          onSubmit={(values) => onSubmit(values)}
          isLoading={isLoading}
          defaultValues={
            defaultValues?.mode === "po_based" ? defaultValues : undefined
          }
          hidePOSelector={lockMode}
        />
      ) : (
        <DirectForm
          key="direct"
          suppliers={suppliers}
          products={products}
          onSubmit={(values) => onSubmit(values)}
          isLoading={isLoading}
          defaultValues={
            defaultValues?.mode === "direct" ? defaultValues : undefined
          }
        />
      )}
    </div>
  );
}
