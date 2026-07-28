"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { InventorySettings } from "../types";

interface InventorySettingsFormProps {
  settings: InventorySettings;
  onSave: (data: InventorySettings) => Promise<void>;
  isSubmitting: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

export function InventorySettingsForm({
  settings,
  onSave,
  isSubmitting,
  onDirtyChange,
}: InventorySettingsFormProps) {
  const [formData, setFormData] = React.useState<InventorySettings>(settings);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof InventorySettings, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onDirtyChange(JSON.stringify(updated) !== JSON.stringify(settings));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onDirtyChange(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-none border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Inventory & Stock Rules</h3>
          <p className="text-xs text-muted-foreground">
            Default thresholds, stock reservations, negative inventory policy, and barcode format specifications.
          </p>
        </div>

        {success && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Settings updated
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-medium mb-1">Default Low Stock Reorder Threshold</label>
          <input
            type="number"
            min={0}
            value={formData.lowStockThresholdDefault}
            onChange={(e) => handleChange("lowStockThresholdDefault", Number(e.target.value))}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Stock Reservation Expiry (Hours)</label>
          <input
            type="number"
            min={1}
            max={168}
            value={formData.reservationExpiryHours}
            onChange={(e) => handleChange("reservationExpiryHours", Number(e.target.value))}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Default Barcode Specification</label>
          <select
            value={formData.barcodeFormat}
            onChange={(e) => handleChange("barcodeFormat", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="CODE128">CODE 128 (Standard Industrial)</option>
            <option value="EAN13">EAN 13 (International Retail)</option>
            <option value="QR">QR Code (2D High Capacity)</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableStockReservation"
              checked={formData.enableStockReservation}
              onChange={(e) => handleChange("enableStockReservation", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="enableStockReservation" className="font-medium cursor-pointer">
              Enable Stock Reservations on Pending Orders / Releases
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoBatchTracking"
              checked={formData.autoBatchTracking}
              onChange={(e) => handleChange("autoBatchTracking", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="autoBatchTracking" className="font-medium cursor-pointer">
              Automatically assign Batch numbers during GRN receipts
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowNegativeStock"
              checked={formData.allowNegativeStock}
              onChange={(e) => handleChange("allowNegativeStock", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="allowNegativeStock" className="font-medium cursor-pointer text-destructive">
              Allow Negative Stock Balance (Use with caution)
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Inventory Settings"}
        </button>
      </div>
    </form>
  );
}
