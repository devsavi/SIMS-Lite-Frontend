"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirmLeave: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  onConfirmLeave,
  onCancel,
}: UnsavedChangesDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold">Unsaved Changes Detected</h3>

        <p className="text-xs text-muted-foreground">
          You have unsaved changes in your system configuration settings. If you switch tabs or leave this page without saving, your modifications will be discarded.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Stay & Keep Editing
          </button>
          <button
            type="button"
            onClick={onConfirmLeave}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Discard & Leave
          </button>
        </div>
      </div>
    </div>
  );
}
