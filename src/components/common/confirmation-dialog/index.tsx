"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Base ConfirmationDialog
// ---------------------------------------------------------------------------

export type ConfirmationVariant = "danger" | "warning" | "success" | "info";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog body description */
  description: string;
  /** Visual variant controlling icon and confirm button colour */
  variant?: ConfirmationVariant;
  /** Confirm button text. Defaults to "Confirm" */
  confirmLabel?: string;
  /** Cancel button text. Defaults to "Cancel" */
  cancelLabel?: string;
  /** Whether the confirm action is in progress */
  loading?: boolean;
  /** Called when the user confirms */
  onConfirm: () => void | Promise<void>;
}

const variantConfig = {
  danger: {
    icon: <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />,
    iconBg: "bg-destructive/10",
    confirmClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />,
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    confirmClass: "",
  },
  success: {
    icon: <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    confirmClass: "bg-green-600 text-white hover:bg-green-700",
  },
  info: {
    icon: <Info className="h-6 w-6 text-primary" aria-hidden="true" />,
    iconBg: "bg-primary/10",
    confirmClass: "",
  },
};

/**
 * ConfirmationDialog — accessible modal that requires explicit user confirmation.
 *
 * @example
 * <ConfirmationDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Approve Purchase Order"
 *   description="This action cannot be undone. The order will be sent to the supplier."
 *   variant="warning"
 *   onConfirm={handleApprove}
 * />
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "info",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
}: ConfirmationDialogProps) {
  const cfg = variantConfig[variant];

  async function handleConfirm() {
    await onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center",
                cfg.iconBg
              )}
            >
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            className={cn(cfg.confirmClass)}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Please wait…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// DeleteDialog — pre-configured danger confirmation
// ---------------------------------------------------------------------------

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Name of the item being deleted (shown in description) */
  itemName?: string;
  /** Custom description (overrides itemName-based description) */
  description?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * DeleteDialog — pre-styled deletion confirmation modal.
 *
 * @example
 * <DeleteDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   itemName="Product #1234"
 *   onConfirm={handleDelete}
 * />
 */
export function DeleteDialog({
  open,
  onOpenChange,
  itemName,
  description,
  loading,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">Delete{itemName ? ` "${itemName}"` : ""}</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {description ??
                  `Are you sure you want to delete${itemName ? ` "${itemName}"` : " this item"}? This action cannot be undone.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// UnsavedChangesDialog
// ---------------------------------------------------------------------------

export interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave?: () => void | Promise<void>;
  savingLabel?: string;
}

/**
 * UnsavedChangesDialog — warns the user before navigating away from a dirty form.
 *
 * @example
 * <UnsavedChangesDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   onDiscard={() => router.back()}
 *   onSave={handleSave}
 * />
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  onSave,
  savingLabel = "Save & Continue",
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-yellow-100 dark:bg-yellow-900/30">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">Unsaved Changes</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                You have unsaved changes. Do you want to save them before leaving, or discard them?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="sm:mr-auto">
            Keep Editing
          </Button>
          <Button variant="outline" onClick={onDiscard}>
            Discard Changes
          </Button>
          {onSave && (
            <Button onClick={async () => { await onSave(); onOpenChange(false); }}>
              {savingLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
