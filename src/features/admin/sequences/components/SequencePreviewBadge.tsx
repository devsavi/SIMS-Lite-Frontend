"use client";

import React from "react";

interface SequencePreviewBadgeProps {
  prefix: string;
  nextNumber: number;
  paddingDigits: number;
  suffix: string;
}

export function formatSequenceNumber(
  prefix: string,
  nextNumber: number,
  paddingDigits: number,
  suffix: string
): string {
  const padded = String(nextNumber).padStart(paddingDigits || 5, "0");
  return `${prefix || ""}${padded}${suffix || ""}`;
}

export function SequencePreviewBadge({
  prefix,
  nextNumber,
  paddingDigits,
  suffix,
}: SequencePreviewBadgeProps) {
  const preview = formatSequenceNumber(prefix, nextNumber, paddingDigits, suffix);

  return (
    <span className="inline-flex items-center rounded bg-primary/10 border border-primary/20 px-3 py-1 font-mono text-xs font-bold text-primary">
      Preview: {preview}
    </span>
  );
}
