"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { NotificationSettings } from "../types";

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onSave: (data: NotificationSettings) => Promise<void>;
  isSubmitting: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

export function NotificationSettingsForm({
  settings,
  onSave,
  isSubmitting,
  onDirtyChange,
}: NotificationSettingsFormProps) {
  const [formData, setFormData] = React.useState<NotificationSettings>(settings);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof NotificationSettings, value: any) => {
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
          <h3 className="text-base font-semibold text-foreground">Notification & Alert Rules</h3>
          <p className="text-xs text-muted-foreground">
            Configure system alert triggers, email notifications, and digest frequency preferences.
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
          <label className="block font-medium mb-1">Email Digest Delivery Frequency</label>
          <select
            value={formData.digestFrequency}
            onChange={(e) => handleChange("digestFrequency", e.target.value)}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="REALTIME">Real-time Immediate Alerts</option>
            <option value="DAILY">Daily Summary Digest</option>
            <option value="WEEKLY">Weekly Overview Digest</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="emailAlertsEnabled"
              checked={formData.emailAlertsEnabled}
              onChange={(e) => handleChange("emailAlertsEnabled", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="emailAlertsEnabled" className="font-medium cursor-pointer">
              Enable Global Email Notification Subscriptions
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="stockLevelAlerts"
              checked={formData.stockLevelAlerts}
              onChange={(e) => handleChange("stockLevelAlerts", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="stockLevelAlerts" className="font-medium cursor-pointer">
              Notify on Low Stock / Out-of-Stock Trigger Events
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="poApprovalAlerts"
              checked={formData.poApprovalAlerts}
              onChange={(e) => handleChange("poApprovalAlerts", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="poApprovalAlerts" className="font-medium cursor-pointer">
              Notify when Purchase Orders require manager approval
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="securityAlerts"
              checked={formData.securityAlerts}
              onChange={(e) => handleChange("securityAlerts", e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="securityAlerts" className="font-medium cursor-pointer">
              Send immediate security alerts for new device logins & failed authentication
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
          {isSubmitting ? "Saving..." : "Save Notification Settings"}
        </button>
      </div>
    </form>
  );
}
