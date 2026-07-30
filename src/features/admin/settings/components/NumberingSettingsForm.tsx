"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { NumberingSettings, NumberingSequenceEntry } from "../types";

interface NumberingSettingsFormProps {
  settings: NumberingSettings;
  onSave: (data: NumberingSettings) => Promise<void>;
  isSubmitting: boolean;
  onDirtyChange: (isDirty: boolean) => void;
}

type SequenceKey = "po" | "grn" | "srn";

const SEQUENCE_LABELS: Record<SequenceKey, string> = {
  po: "Purchase Orders (PO)",
  grn: "Goods Received Notes (GRN)",
  srn: "Stock Release Notes (SRN)",
};

export function NumberingSettingsForm({
  settings,
  onSave,
  isSubmitting,
  onDirtyChange,
}: NumberingSettingsFormProps) {
  const [formData, setFormData] = React.useState<NumberingSettings>(settings);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSequenceChange = (
    key: SequenceKey,
    field: keyof NumberingSequenceEntry,
    value: string | number | null
  ) => {
    const updated: NumberingSettings = {
      ...formData,
      [key]: { ...formData[key], [field]: value },
    };
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
          <h3 className="text-base font-semibold text-foreground">Numbering Sequences</h3>
          <p className="text-xs text-muted-foreground">
            Configure auto-incrementing document number formats for Purchase Orders, GRNs, and Stock Releases.
          </p>
        </div>

        {success && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Settings updated
          </span>
        )}
      </div>

      <div className="space-y-6 text-sm">
        {(["po", "grn", "srn"] as SequenceKey[]).map((key) => (
          <div key={key} className="rounded-none border border-border p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">{SEQUENCE_LABELS[key]}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">Prefix</label>
                <input
                  type="text"
                  value={formData[key].prefix}
                  onChange={(e) => handleSequenceChange(key, "prefix", e.target.value)}
                  className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                  placeholder="e.g. PO"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Suffix</label>
                <input
                  type="text"
                  value={formData[key].suffix || ""}
                  onChange={(e) =>
                    handleSequenceChange(key, "suffix", e.target.value || null)
                  }
                  className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Next Sequence No.</label>
                <input
                  type="number"
                  min={1}
                  value={formData[key].next_sequence}
                  onChange={(e) =>
                    handleSequenceChange(key, "next_sequence", Number(e.target.value))
                  }
                  className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Preview:{" "}
              <span className="font-mono font-semibold text-foreground">
                {formData[key].prefix}
                {formData[key].next_sequence}
                {formData[key].suffix || ""}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Numbering Settings"}
        </button>
      </div>
    </form>
  );
}
