"use client";

import React from "react";
import { Edit2, Hash } from "lucide-react";
import type { NumberingSequence } from "../types";
import { SequencePreviewBadge } from "./SequencePreviewBadge";
import { formatDateTime } from "../../users/utils/user-helpers";

interface SequenceListProps {
  sequences: NumberingSequence[];
  isLoading: boolean;
  onEditSequence: (sequence: NumberingSequence) => void;
}

export function SequenceList({ sequences, isLoading, onEditSequence }: SequenceListProps) {
  return (
    <div className="overflow-x-auto rounded-none border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm text-foreground">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
          <tr>
            <th scope="col" className="px-4 py-3">Document Module</th>
            <th scope="col" className="px-4 py-3">Prefix / Suffix</th>
            <th scope="col" className="px-4 py-3">Next Serial</th>
            <th scope="col" className="px-4 py-3">Reset Rule</th>
            <th scope="col" className="px-4 py-3">Generated Sample</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3"><div className="h-4 w-36 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-24 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-12 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-20 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-6 w-32 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3 text-right"><div className="ml-auto h-6 w-8 rounded-none bg-muted"></div></td>
              </tr>
            ))
          ) : sequences.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No document numbering sequences configured.
              </td>
            </tr>
          ) : (
            sequences.map((seq) => (
              <tr key={seq.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <span>{seq.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  <span>{seq.prefix || "(None)"}</span> / <span>{seq.suffix || "(None)"}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                  {seq.nextNumber}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <span className="rounded-none bg-muted px-2 py-0.5 font-semibold">
                    {seq.resetFrequency}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <SequencePreviewBadge
                    prefix={seq.prefix}
                    nextNumber={seq.nextNumber}
                    paddingDigits={seq.paddingDigits}
                    suffix={seq.suffix}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEditSequence(seq)}
                    title="Edit Sequence"
                    aria-label={`Edit ${seq.title}`}
                    className="inline-flex items-center gap-1.5 rounded-none border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Configure
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
