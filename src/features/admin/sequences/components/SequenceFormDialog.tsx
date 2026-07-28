"use client";

import React from "react";
import { X, Hash } from "lucide-react";
import type { NumberingSequence, UpdateSequenceDTO, ResetFrequency } from "../types";
import { SequencePreviewBadge } from "./SequencePreviewBadge";

interface SequenceFormDialogProps {
  sequence: NumberingSequence | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: UpdateSequenceDTO) => Promise<void>;
  isSubmitting: boolean;
}

export function SequenceFormDialog({
  sequence,
  isOpen,
  onClose,
  onUpdate,
  isSubmitting,
}: SequenceFormDialogProps) {
  const [formData, setFormData] = React.useState<UpdateSequenceDTO>({
    prefix: "",
    suffix: "",
    nextNumber: 1,
    paddingDigits: 5,
    resetFrequency: "NEVER",
  });

  React.useEffect(() => {
    if (sequence) {
      setFormData({
        prefix: sequence.prefix || "",
        suffix: sequence.suffix || "",
        nextNumber: sequence.nextNumber || 1,
        paddingDigits: sequence.paddingDigits || 5,
        resetFrequency: sequence.resetFrequency || "NEVER",
      });
    }
  }, [sequence, isOpen]);

  if (!isOpen || !sequence) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(sequence.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Hash className="h-5 w-5 text-primary" />
            Edit Sequence — {sequence.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Live Preview Header */}
          <div className="rounded-md border border-border bg-muted/40 p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Generated Output Sample</span>
            <SequencePreviewBadge
              prefix={formData.prefix}
              nextNumber={formData.nextNumber}
              paddingDigits={formData.paddingDigits}
              suffix={formData.suffix}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Document Prefix</label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                placeholder="e.g. PO-"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Document Suffix</label>
              <input
                type="text"
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                placeholder="e.g. -2026"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Next Serial Number *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.nextNumber}
                onChange={(e) => setFormData({ ...formData, nextNumber: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Padding Zero Digits *</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.paddingDigits}
                onChange={(e) => setFormData({ ...formData, paddingDigits: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Sequence Reset Frequency</label>
              <select
                value={formData.resetFrequency}
                onChange={(e) => setFormData({ ...formData, resetFrequency: e.target.value as ResetFrequency })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="NEVER">Never Reset (Continuous Increment)</option>
                <option value="YEARLY">Reset to 1 Yearly (On Jan 1st)</option>
                <option value="MONTHLY">Reset to 1 Monthly (On 1st of month)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input bg-background px-4 py-2 font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Sequence Rules"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
