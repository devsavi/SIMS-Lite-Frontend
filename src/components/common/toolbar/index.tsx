import * as React from "react";
import { cn } from "@/utils/cn";
import { Separator } from "@/app/components/ui/separator";

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

export interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Toolbar — horizontal strip of controls (search, filters, action buttons).
 *
 * @example
 * <Toolbar>
 *   <SearchInput />
 *   <ToolbarSeparator />
 *   <FilterPanel />
 *   <Button>Add</Button>
 * </Toolbar>
 */
export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToolbarLeft / ToolbarRight — positional groups
// ---------------------------------------------------------------------------

export function ToolbarLeft({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

export function ToolbarRight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToolbarSeparator
// ---------------------------------------------------------------------------

export function ToolbarSeparator({ className }: { className?: string }) {
  return (
    <Separator
      orientation="vertical"
      className={cn("hidden h-5 sm:block", className)}
      aria-hidden="true"
    />
  );
}
