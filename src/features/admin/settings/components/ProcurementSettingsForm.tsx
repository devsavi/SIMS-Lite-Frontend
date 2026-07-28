"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { ProcurementSettings } from "../types";

interface ProcurementSettingsFormProps {
  settings: ProcurementSettings;
  onSave: (data: ProcurementSettings) => Promise<void>;
  isSubmitting: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

export function ProcurementSettingsForm({
  settings,
  onSave,
  isSubmitting,
  onDirtyChange,
}: ProcurementSettingsFormProps) {
  const [formData, setFormData] = React.useState<ProcurementSettings>(settings);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof ProcurementSettings, value: any) => {
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Procurement & PO Controls</h3>
          <p className="text-xs text-muted-foreground">
            Auto-approval PO value thresholds, GRN inspection requirements, and receiving tolerance.
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
          <label className="block font-medium mb-1">Auto-Approve PO Threshold Limit ($)</label>
          <input
            type="number"
            min={0}
            value={formData.autoApprovePoLimit}
            onChange={(e) => handleChange("autoApprovePoLimit", Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Default Payment Terms</label>
          <select
            value={formData.defaultPaymentTerms}
            onChange={(e) => handleChange("defaultPaymentTerms", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 60">Net 60</option>
            <option value="Due on Receipt">Due on Receipt</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Max Allowable Over-Receiving Tolerance (%)</label>
          <input
            type="number"
            min={0}
            max={50}
            value={formData.allowOverReceivingPercentage}
            onChange={(e) => handleChange("allowOverReceivingPercentage", Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="sm:col-span-2 space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requireGrnInspection"
              checked={formData.requireGrnInspection}
              onChange={(e) => handleChange("requireGrnInspection", e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="requireGrnInspection" className="font-medium cursor-pointer">
              Mandate Quality Inspection Verification step for all Goods Received Notes (GRN)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableSupplierRatings"
              checked={formData.enableSupplierRatings}
              onChange={(e) => handleChange("enableSupplierRatings", e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="enableSupplierRatings" className="font-medium cursor-pointer">
              Track and calculate supplier performance metrics (On-time delivery, defect rate)
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Procurement Settings"}
        </button>
      </div>
    </form>
  );
}
