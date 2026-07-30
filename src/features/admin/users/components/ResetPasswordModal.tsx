"use client";

import React from "react";
import { X, KeyRound, Eye, EyeOff, Check } from "lucide-react";
import type { UserItem } from "../types";

interface ResetPasswordModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (userId: string, autoGenerate: boolean, newPassword?: string) => Promise<void>;
  isSubmitting: boolean;
}

// ─── Password strength helper ────────────────────────────────────────────────
function calcStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_BAR_COLORS = [
  "",
  "bg-red-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-emerald-500",
] as const;

// ─── PasswordInput sub-component ─────────────────────────────────────────────
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••••••"}
        className="w-full rounded-none border border-input bg-background px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
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

  const strengthScore = calcStrength(newPassword);

  React.useEffect(() => {
    setNewPassword("");
    setConfirmPassword("");
    setAutoGenerate(true);
    setError("");
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(pwd)) return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!autoGenerate) {
      const validationError = validatePassword(newPassword);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    await onResetPassword(user.id, autoGenerate, autoGenerate ? undefined : newPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-none border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="h-5 w-5 text-primary" />
            Reset Password — {user.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-none p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* Auto-generate toggle */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="autoGen"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <span className="text-sm font-medium leading-snug">
              Auto-generate secure temporary password and email to user
            </span>
          </label>

          {/* Custom password fields */}
          {!autoGenerate && (
            <div className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="newPwd" className="block text-xs font-medium">
                  New Password <span className="text-destructive">*</span>
                </label>
                <PasswordInput
                  id="newPwd"
                  value={newPassword}
                  onChange={setNewPassword}
                />

                {/* Strength bar */}
                {newPassword && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className="font-medium">{STRENGTH_LABELS[strengthScore]}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-muted">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className={`h-full transition-colors ${strengthScore >= n ? STRENGTH_BAR_COLORS[n] : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPwd" className="block text-xs font-medium">
                  Confirm New Password <span className="text-destructive">*</span>
                </label>
                <PasswordInput
                  id="confirmPwd"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat new password"
                />
              </div>

              {/* Requirements checklist */}
              <div className="border border-border bg-muted/20 p-3 text-xs space-y-1.5">
                <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  {[
                    { label: "Minimum 8 characters", met: newPassword.length >= 8 },
                    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
                    { label: "One number (0–9)", met: /[0-9]/.test(newPassword) },
                    { label: "Special character", met: /[^A-Za-z0-9]/.test(newPassword) },
                  ].map(({ label, met }) => (
                    <span
                      key={label}
                      className={`flex items-center gap-1.5 ${
                        met ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
                      }`}
                    >
                      <Check className="h-3 w-3 shrink-0" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-xs text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-none border border-input bg-background px-4 py-2 font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Resetting…" : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
