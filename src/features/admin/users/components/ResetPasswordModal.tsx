"use client";

import React from "react";
import { X, KeyRound } from "lucide-react";
import type { UserItem } from "../types";

interface ResetPasswordModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (userId: string, newPassword?: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ResetPasswordModal({
  user,
  isOpen,
  onClose,
  onResetPassword,
  isSubmitting,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [autoGenerate, setAutoGenerate] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setNewPassword("");
    setConfirmPassword("");
    setAutoGenerate(true);
    setError("");
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoGenerate) {
      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    await onResetPassword(user.id, autoGenerate ? undefined : newPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="h-5 w-5 text-primary" />
            Reset Password — {user.name}
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoGen"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="autoGen" className="text-sm font-medium">
              Auto-generate secure temporary password and email to user
            </label>
          </div>

          {!autoGenerate && (
            <>
              <div>
                <label className="block font-medium mb-1">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Repeat new password"
                />
              </div>
            </>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
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
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
