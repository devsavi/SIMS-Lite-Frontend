import * as React from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// PageHeader
// ---------------------------------------------------------------------------

export interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Slot for action buttons (top-right) */
  actions?: React.ReactNode;
  /** Optional breadcrumb above the title */
  breadcrumb?: React.ReactNode;
  /** Extra class names */
  className?: string;
}

/**
 * PageHeader — consistent header used at the top of every page.
 *
 * @example
 * <PageHeader
 *   title="Products"
 *   description="Manage your product catalog"
 *   actions={<Button>Add Product</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {breadcrumb && <div className="mb-1">{breadcrumb}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
