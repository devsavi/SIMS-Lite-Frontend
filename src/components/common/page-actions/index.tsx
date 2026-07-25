import * as React from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// PageActions
// ---------------------------------------------------------------------------

export interface PageActionsProps {
  children: React.ReactNode;
  /** Alignment of actions */
  align?: "left" | "right" | "between";
  className?: string;
}

/**
 * PageActions — a flex row of action buttons / controls.
 * Use inside PageHeader.actions or as a standalone toolbar row.
 *
 * @example
 * <PageActions align="between">
 *   <SearchInput />
 *   <Button>Add Item</Button>
 * </PageActions>
 */
export function PageActions({
  children,
  align = "right",
  className,
}: PageActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "right" && "justify-end",
        align === "left" && "justify-start",
        align === "between" && "justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
