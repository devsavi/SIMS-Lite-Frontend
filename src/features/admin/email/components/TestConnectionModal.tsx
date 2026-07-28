"use client";

import React from "react";
import { X, Send, CheckCircle2, AlertCircle } from "lucide-react";
import type { TestConnectionResponse } from "../types";

interface TestConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestConnection: (recipientEmail: string) => Promise<TestConnectionResponse>;
  isTesting: boolean;
}

export function TestConnectionModal({
  isOpen,
  onClose,
  onTestConnection,
  isTesting,
}: TestConnectionModalProps) {
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [result, setResult] = React.useState<TestConnectionResponse | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setRecipientEmail("");
    setResult(null);
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !/\S+@\S+\.\S+/.test(recipientEmail)) {
      setError("Valid recipient email address is required");
      return;
    }
    setError("");
    setResult(null);
    try {
      const res = await onTestConnection(recipientEmail);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Failed to establish SMTP connection",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Send className="h-5 w-5 text-primary" />
            Test SMTP Connection
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
          <div>
            <label className="block font-medium mb-1">Send Test Dispatch To *</label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. admin@simslite.com"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          {result && (
            <div
              className={`rounded-md p-3.5 border text-xs flex items-start gap-2.5 ${
                result.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
                  : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              )}
              <div>
                <div className="font-semibold">{result.success ? "Connection Successful" : "Connection Failed"}</div>
                <div className="mt-0.5">{result.message}</div>
                {result.responseTimeMs && (
                  <div className="mt-1 text-[10px] opacity-75 font-mono">Response time: {result.responseTimeMs}ms</div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input bg-background px-4 py-2 font-medium hover:bg-accent"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isTesting}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {isTesting ? "Testing Connection..." : "Send Test Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
