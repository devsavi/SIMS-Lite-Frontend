import * as React from "react";
import { cn } from "@/utils/cn";
import { InboxIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  /** Heading text */
  title?: string;
  /** Supporting text */
  description?: string;
  /** Custom icon (defaults to inbox icon) */
  icon?: React.ReactNode;
  /** Call-to-action slot */
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState — shown when a list or table has no data.
 *
 * @example
 * <EmptyState
 *   title="No products found"
 *   description="Try adjusting your filters or add a new product."
 *   action={<Button>Add Product</Button>}
 * />
 */
export function EmptyState({
  title = "No data",
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
      role="status"
      aria-label={title}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center bg-muted text-muted-foreground">
        {icon ?? <InboxIcon className="h-8 w-8" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
