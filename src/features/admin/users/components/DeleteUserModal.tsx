"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import type { UserItem } from "../types";

interface DeleteUserModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function DeleteUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: DeleteUserModalProps) {
  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    await onConfirm(user.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
    >
      <div className="w-full max-w-md rounded-none border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-destructive/10">
          <Trash2 className="h-6 w-6 text-destructive" />
        </div>

        {/* Title */}
        <h3 id="delete-user-title" className="text-lg font-bold">
          Delete User Account?
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          You are about to permanently delete{" "}
          <strong className="text-foreground">{user.name}</strong> (
          <span className="font-mono text-xs">{user.email}</span>). This action{" "}
          <strong className="text-destructive">cannot be undone</strong> and
          will remove all data associated with this account.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-none border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-none bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
          >
            {isSubmitting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
