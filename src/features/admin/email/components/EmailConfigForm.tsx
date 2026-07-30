"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { EmailConfig, UpdateEmailConfigDTO } from "../types";

interface EmailConfigFormProps {
  config: EmailConfig;
  onSave: (data: UpdateEmailConfigDTO) => Promise<void>;
  isSubmitting: boolean;
}

export function EmailConfigForm({ config, onSave, isSubmitting }: EmailConfigFormProps) {
  const [formData, setFormData] = React.useState<UpdateEmailConfigDTO>({
    sender_display_name: config.sender_display_name || "",
    sender_email: config.sender_email || "",
  });

  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData({
      sender_display_name: config.sender_display_name || "",
      sender_email: config.sender_email || "",
    });
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-none border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Sender Identity Configuration</h3>
          <p className="text-xs text-muted-foreground">
            Configure the display name and sender email address used for outgoing system emails.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Config saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-medium mb-1">Sender Display Name *</label>
          <input
            type="text"
            required
            value={formData.sender_display_name}
            onChange={(e) => setFormData({ ...formData, sender_display_name: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. SIMS Lite"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Sender Email Address *</label>
          <input
            type="email"
            required
            value={formData.sender_email}
            onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. noreply@example.com"
          />
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-none bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Email Configuration"}
        </button>
      </div>
    </form>
  );
}
