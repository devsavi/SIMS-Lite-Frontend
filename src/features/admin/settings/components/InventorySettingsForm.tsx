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
          <h3 className="text-base font-semibold text-foreground">Inventory Settings</h3>
          <p className="text-xs text-muted-foreground">
            Configure default inventory thresholds and stock alert levels.
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
          <label className="block font-medium mb-1">Default Low Stock Level</label>
          <p className="text-xs text-muted-foreground mb-2">
            Items at or below this quantity will be flagged as low stock.
          </p>
          <input
            type="number"
            min={0}
            value={formData.default_low_stock_level}
            onChange={(e) => handleChange("default_low_stock_level", Number(e.target.value))}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
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
