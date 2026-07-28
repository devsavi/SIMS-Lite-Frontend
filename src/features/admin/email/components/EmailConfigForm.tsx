"use client";

import React from "react";
import { Save, Send, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import type { EmailConfig, UpdateEmailConfigDTO, EncryptionType } from "../types";

interface EmailConfigFormProps {
  config: EmailConfig;
  onSave: (data: UpdateEmailConfigDTO) => Promise<void>;
  onOpenTestModal: () => void;
  isSubmitting: boolean;
}

export function EmailConfigForm({
  config,
  onSave,
  onOpenTestModal,
  isSubmitting,
}: EmailConfigFormProps) {
  const [formData, setFormData] = React.useState<UpdateEmailConfigDTO>({
    smtpHost: config.smtpHost || "",
    smtpPort: config.smtpPort || 587,
    smtpUser: config.smtpUser || "",
    smtpPassword: "",
    encryptionType: config.encryptionType || "TLS",
    senderName: config.senderName || "",
    senderEmail: config.senderEmail || "",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData({
      smtpHost: config.smtpHost || "",
      smtpPort: config.smtpPort || 587,
      smtpUser: config.smtpUser || "",
      smtpPassword: "",
      encryptionType: config.encryptionType || "TLS",
      senderName: config.senderName || "",
      senderEmail: config.senderEmail || "",
    });
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">SMTP Gateway & Sender Credentials</h3>
          <p className="text-xs text-muted-foreground">
            Configure outgoing mail server parameters for system alerts, password resets, and notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Config saved
            </span>
          )}
          <button
            type="button"
            onClick={onOpenTestModal}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Send className="h-3.5 w-3.5" />
            Test Connection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-medium mb-1">SMTP Host Server *</label>
          <input
            type="text"
            required
            value={formData.smtpHost}
            onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. smtp.mailgun.org or smtp.office365.com"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">SMTP Port *</label>
          <input
            type="number"
            required
            min={1}
            max={65535}
            value={formData.smtpPort}
            onChange={(e) => setFormData({ ...formData, smtpPort: Number(e.target.value) })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="587 or 465"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Encryption Protocol *</label>
          <select
            value={formData.encryptionType}
            onChange={(e) => setFormData({ ...formData, encryptionType: e.target.value as EncryptionType })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="TLS">STARTTLS / TLS (Recommended — Port 587)</option>
            <option value="SSL">SSL / Implicit (Port 465)</option>
            <option value="NONE">None (Plaintext — Internal Only)</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">SMTP Username *</label>
          <input
            type="text"
            required
            value={formData.smtpUser}
            onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-medium mb-1">
            SMTP Password {config.isPasswordSet && "(Masked — enter to overwrite)"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.smtpPassword || ""}
              onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
              className="w-full rounded-md border border-input bg-background pr-10 pl-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
              placeholder={config.isPasswordSet ? "••••••••••••••••" : "Enter SMTP Password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-4 sm:col-span-2">
          <h4 className="text-sm font-semibold mb-3">Sender Identity Configuration</h4>
        </div>

        <div>
          <label className="block font-medium mb-1">Sender Display Name *</label>
          <input
            type="text"
            required
            value={formData.senderName}
            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. SIMS Lite System Alerts"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Sender Email Address *</label>
          <input
            type="email"
            required
            value={formData.senderEmail}
            onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. no-reply@simslite.com"
          />
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving Configuration..." : "Save Email Configuration"}
        </button>
      </div>
    </form>
  );
}
