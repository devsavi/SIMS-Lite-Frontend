"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { ReportSettings } from "../types";

interface ReportSettingsFormProps {
  settings: ReportSettings;
  onSave: (data: ReportSettings) => Promise<void>;
  isSubmitting: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

export function ReportSettingsForm({
  settings,
  onSave,
  isSubmitting,
  onDirtyChange,
}: ReportSettingsFormProps) {
  const [formData, setFormData] = React.useState<ReportSettings>(settings);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof ReportSettings, value: any) => {
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
          <h3 className="text-base font-semibold text-foreground">Reporting & Export Settings</h3>
          <p className="text-xs text-muted-foreground">
            Default document generation formats, paper sizes, and header logo inclusion options.
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
          <label className="block font-medium mb-1">Default Export Format</label>
          <select
            value={formData.defaultExportFormat}
            onChange={(e) => handleChange("defaultExportFormat", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="excel">Microsoft Excel (.xlsx)</option>
            <option value="csv">Comma-Separated Values (.csv)</option>
            <option value="pdf">Adobe PDF Document (.pdf)</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">PDF Page Setup Size</label>
          <select
            value={formData.pageSize}
            onChange={(e) => handleChange("pageSize", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="A4">A4 (210 x 297 mm)</option>
            <option value="LETTER">US Letter (8.5 x 11 in)</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeHeaderLogo"
              checked={formData.includeHeaderLogo}
              onChange={(e) => handleChange("includeHeaderLogo", e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="includeHeaderLogo" className="font-medium cursor-pointer">
              Embed company logo header on generated PDFs and printouts
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scheduledReportsEnabled"
              checked={formData.scheduledReportsEnabled}
              onChange={(e) => handleChange("scheduledReportsEnabled", e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="scheduledReportsEnabled" className="font-medium cursor-pointer">
              Enable automated scheduled email reports generator
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
          {isSubmitting ? "Saving..." : "Save Report Settings"}
        </button>
      </div>
    </form>
  );
}
