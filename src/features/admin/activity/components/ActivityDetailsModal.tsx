"use client";

import React from "react";
import { X, Activity, User, MapPin, Clock, Tag, Hash } from "lucide-react";
import type { AuditLogEntry } from "../types";

interface AuditLogDetailsModalProps {
  entry: AuditLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatActionLabel(action: string) {
  const parts = action.split(".");
  const cat = parts[0] ?? "";
  const verb = parts.slice(1).join(" ").replace(/_/g, " ");
  return { category: cat.toUpperCase(), verb: verb ? verb.replace(/\b\w/g, (c) => c.toUpperCase()) : action };
}

export function AuditLogDetailsModal({ entry, isOpen, onClose }: AuditLogDetailsModalProps) {
  if (!isOpen || !entry) return null;

  const { category, verb } = formatActionLabel(entry.action);

  const actorName = entry.actor?.full_name ?? entry.actor_id ?? "Unknown";
  const actorEmail = entry.actor?.email ? ` — ${entry.actor.email}` : "";

  const fields = [
    { icon: User, label: "Actor", value: `${actorName}${actorEmail}` },
    { icon: Hash, label: "Actor ID", value: entry.actor_id, mono: true },
    { icon: Tag, label: "Action", value: `${category} › ${verb}` },
    { icon: Tag, label: "Resource Type", value: entry.resource_type },
    { icon: Hash, label: "Resource ID", value: entry.resource_id, mono: true },
    { icon: MapPin, label: "IP Address", value: entry.ip_address, mono: true },
    { icon: Clock, label: "Timestamp", value: formatDateTime(entry.created_at) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-none border border-border bg-card shadow-xl text-foreground animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Activity Log Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status banner */}
        <div className={[
          "px-6 py-2 text-xs font-semibold uppercase tracking-widest text-center border-b border-border",
          entry.status === "success"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
        ].join(" ")}>
          {entry.status}
        </div>

        {/* Fields */}
        <div className="p-6 space-y-3">
          {fields.map(({ icon: Icon, label, value, mono }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className={["text-sm text-foreground", mono ? "font-mono" : "font-medium"].join(" ")}>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="font-mono text-[10px] text-muted-foreground truncate max-w-xs">{entry.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-none bg-secondary px-4 py-1.5 text-xs font-medium hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
