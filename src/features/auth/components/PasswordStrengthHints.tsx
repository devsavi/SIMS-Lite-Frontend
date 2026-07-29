"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface Rule {
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_RULES: Rule[] = [
  {
    label: "At least 8 characters",
    test: (v) => v.length >= 8,
  },
  {
    label: "At least one uppercase letter (A–Z)",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    label: "At least one lowercase letter (a–z)",
    test: (v) => /[a-z]/.test(v),
  },
  {
    label: "At least one digit (0–9)",
    test: (v) => /[0-9]/.test(v),
  },
  {
    label: "At least one special character (!@#$%^&*()-_=+[]{}|;:,.<>?)",
    test: (v) => /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(v),
  },
];

interface PasswordStrengthHintsProps {
  value: string;
  /** Extra class names applied to the container */
  className?: string;
}

/**
 * Displays a live checklist of password requirements.
 * Each rule turns green when satisfied and stays red/gray until it is.
 */
export function PasswordStrengthHints({
  value,
  className,
}: PasswordStrengthHintsProps) {
  // Only show hints once the user has started typing
  if (!value) return null;

  return (
    <ul
      aria-label="Password requirements"
      className={`mt-2 space-y-1 text-xs${className ? ` ${className}` : ""}`}
    >
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 transition-colors ${
              passed ? "text-green-600 dark:text-green-400" : "text-destructive"
            }`}
          >
            {passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
