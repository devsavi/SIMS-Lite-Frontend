"use client";

import * as React from "react";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/common/sheet";
import { cn } from "@/utils/cn";
import { Badge } from "@/app/components/ui/badge";

// ---------------------------------------------------------------------------
// FilterChip — a single active filter tag
// ---------------------------------------------------------------------------

export interface FilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

/**
 * FilterChip — shows an active filter with a remove button.
 *
 * @example
 * <FilterChip label="Status: Active" onRemove={() => clearFilter("status")} />
 */
export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground",
        className
      )}
    >
      {label}
      <button
        type="button"
        aria-label={`Remove filter: ${label}`}
        onClick={onRemove}
        className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// FilterBar — chip strip + clear all
// ---------------------------------------------------------------------------

export interface FilterBarProps {
  filters: FilterChipProps[];
  onClearAll?: () => void;
  className?: string;
}

/**
 * FilterBar — displays active filter chips with a clear-all button.
 */
export function FilterBar({ filters, onClearAll, className }: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((f) => (
        <FilterChip key={f.label} {...f} />
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterPanel — sheet drawer containing filter controls
// ---------------------------------------------------------------------------

export interface FilterPanelProps {
  /** Slot for filter form controls */
  children: React.ReactNode;
  /** Number of active filters shown in the trigger badge */
  activeCount?: number;
  /** Sheet title */
  title?: string;
  /** Sheet description */
  description?: string;
  /** Footer slot for Apply / Reset buttons */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * FilterPanel — a slide-in sheet for advanced filter controls.
 *
 * @example
 * <FilterPanel activeCount={2} footer={<Button onClick={apply}>Apply</Button>}>
 *   <StatusFilter />
 *   <DateRangeFilter />
 * </FilterPanel>
 */
export function FilterPanel({
  children,
  activeCount = 0,
  title = "Filters",
  description,
  footer,
  className,
}: FilterPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={cn("relative gap-2", className)}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <Filter className="h-3 w-3" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-[1.25rem] px-1 text-xs"
              aria-label={`${activeCount} active filter${activeCount === 1 ? "" : "s"}`}
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-80 flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="border-t border-border px-6 py-4">{footer}</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
