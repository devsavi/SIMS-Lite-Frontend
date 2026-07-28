"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { GeneralSettings } from "../types";

interface GeneralSettingsFormProps {
  settings: GeneralSettings;
  onSave: (data: GeneralSettings) => Promise<void>;
  isSubmitting: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

export function GeneralSettingsForm({
  settings,
  onSave,
  isSubmitting,
  onDirtyChange,
}: GeneralSettingsFormProps) {
  const [formData, setFormData] = React.useState<GeneralSettings>(settings);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof GeneralSettings, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    const isDirty = JSON.stringify(updated) !== JSON.stringify(settings);
    onDirtyChange(isDirty);
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
          <h3 className="text-base font-semibold text-foreground">General Application Settings</h3>
          <p className="text-xs text-muted-foreground">
            System branding, default timezone, session timeouts, and maintenance mode controls.
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
          <label className="block font-medium mb-1">System Application Title *</label>
          <input
            type="text"
            required
            value={formData.siteName}
            onChange={(e) => handleChange("siteName", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Support Email Address *</label>
          <input
            type="email"
            required
            value={formData.supportEmail}
            onChange={(e) => handleChange("supportEmail", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Session Inactivity Timeout (Minutes)</label>
          <input
            type="number"
            min={5}
            max={480}
            value={formData.sessionTimeoutMinutes}
            onChange={(e) => handleChange("sessionTimeoutMinutes", Number(e.target.value))}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Default System Timezone</label>
          <select
            value={formData.timeZone}
            onChange={(e) => handleChange("timeZone", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="UTC">UTC — Coordinated Universal Time</option>
            <option value="America/New_York">EST — Eastern Standard Time</option>
            <option value="America/Los_Angeles">PST — Pacific Standard Time</option>
            <option value="Asia/Colombo">Asia/Colombo (UTC+5:30)</option>
            <option value="Europe/London">GMT/BST — London</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">System Display Date Format</label>
          <select
            value={formData.dateFormat}
            onChange={(e) => handleChange("dateFormat", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (UK / International)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US standard)</option>
          </select>
        </div>

        <div className="sm:col-span-2 pt-2">
          <div className="flex items-center gap-2 rounded-none border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={formData.maintenanceMode}
              onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <div>
              <label htmlFor="maintenanceMode" className="text-sm font-semibold text-foreground cursor-pointer">
                Enable Maintenance Mode
              </label>
              <p className="text-xs text-muted-foreground">
                When enabled, non-admin users will be temporarily restricted from accessing operational modules.
              </p>
            </div>
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
          {isSubmitting ? "Saving..." : "Save General Settings"}
        </button>
      </div>
    </form>
  );
}
