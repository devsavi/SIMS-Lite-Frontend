"use client";

import React from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { UserItem } from "../types";

interface UserStatusToggleProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, status: "ACTIVE" | "INACTIVE") => Promise<void>;
  isSubmitting: boolean;
}

export function UserStatusToggle({
  user,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: UserStatusToggleProps) {
  if (!isOpen || !user) return null;

  const isActivating = user.status !== "ACTIVE";
  const targetStatus = isActivating ? "ACTIVE" : "INACTIVE";

  const handleConfirm = async () => {
    await onConfirm(user.id, targetStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {isActivating ? (
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          )}
        </div>

        <h3 className="text-lg font-bold">
          {isActivating ? "Activate User Account?" : "Deactivate User Account?"}
        </h3>

        <p className="text-xs text-muted-foreground">
          {isActivating ? (
            <>
              User <strong>{user.name}</strong> will be granted active access back to SIMS Lite.
            </>
          ) : (
            <>
              User <strong>{user.name}</strong> will be immediately prevented from logging into SIMS Lite until reactivated.
            </>
          )}
        </p>

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              isActivating ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            } disabled:opacity-50`}
          >
            {isSubmitting ? "Processing..." : isActivating ? "Confirm Activate" : "Confirm Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}
