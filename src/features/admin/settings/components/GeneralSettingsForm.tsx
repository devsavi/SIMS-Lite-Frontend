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
            System title, support contact, and display date format.
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
          <label className="block font-medium mb-1">Application Title *</label>
          <input
            type="text"
            required
            value={formData.app_title}
            onChange={(e) => handleChange("app_title", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. SIMS Lite"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Support Email Address</label>
          <input
            type="email"
            value={formData.support_email || ""}
            onChange={(e) => handleChange("support_email", e.target.value || null)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. support@example.com"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">System Display Date Format</label>
          <select
            value={formData.date_format}
            onChange={(e) => handleChange("date_format", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (UK / International)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US standard)</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Timezone</label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange("timezone", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Colombo">Asia/Colombo (UTC+5:30)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
            <option value="Asia/Dubai">Asia/Dubai (UTC+4:00)</option>
            <option value="Asia/Singapore">Asia/Singapore (UTC+8:00)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (UTC+9:00)</option>
            <option value="Europe/London">Europe/London (UTC+0:00)</option>
            <option value="Europe/Paris">Europe/Paris (UTC+1:00)</option>
            <option value="America/New_York">America/New_York (UTC-5:00)</option>
            <option value="America/Chicago">America/Chicago (UTC-6:00)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (UTC-8:00)</option>
            <option value="Australia/Sydney">Australia/Sydney (UTC+10:00)</option>
          </select>
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
