import * as React from "react";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", spinnerSizes[size], className)}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// InlineLoader
// ---------------------------------------------------------------------------

export interface InlineLoaderProps {
  text?: string;
  size?: SpinnerProps["size"];
  className?: string;
}

export function InlineLoader({
  text = "Loading…",
  size = "sm",
  className,
}: InlineLoaderProps) {
  return (
    <span
      role="status"
      aria-label={text}
      className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
    >
      <Spinner size={size} />
      <span>{text}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// LoadingState — full-section loading placeholder
// ---------------------------------------------------------------------------

export interface LoadingStateProps {
  text?: string;
  className?: string;
}

export function LoadingState({ text = "Loading…", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={text}
      className={cn(
        "flex flex-col items-center justify-center py-16 gap-3",
        className
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FullPageLoader
// ---------------------------------------------------------------------------

export interface FullPageLoaderProps {
  text?: string;
}

export function FullPageLoader({ text = "Loading…" }: FullPageLoaderProps) {
  return (
    <div
      role="status"
      aria-label={text}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background"
    >
      <div className="flex h-14 w-14 items-center justify-center bg-primary/10">
        <Spinner size="lg" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TableSkeleton — row skeletons for data tables
// ---------------------------------------------------------------------------

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Loading table data">
      {/* Header skeleton */}
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 flex-1 animate-pulse bg-muted"
            style={{ maxWidth: i === 0 ? "2rem" : undefined }}
          />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 flex-1 animate-pulse bg-muted"
              style={{
                maxWidth: colIdx === 0 ? "2rem" : undefined,
                opacity: 1 - rowIdx * 0.12,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CardSkeleton — skeleton for stat/app cards
// ---------------------------------------------------------------------------

export interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={cn("border border-border bg-card p-6 shadow-sm", className)}
      aria-busy="true"
    >
      <div className="space-y-3">
        <div className="h-4 w-1/3 animate-pulse bg-muted" />
        <div className="h-8 w-1/2 animate-pulse bg-muted" />
        <div className="h-3 w-1/4 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
