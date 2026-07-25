import * as React from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// AppCard
// ---------------------------------------------------------------------------

export interface AppCardProps {
  children: React.ReactNode;
  /** Optional card title */
  title?: string;
  /** Optional description shown below title */
  description?: string;
  /** Slot for header actions (top-right of header) */
  headerActions?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Remove all padding from the card body (useful for tables) */
  noPadding?: boolean;
  className?: string;
}

/**
 * AppCard — enterprise-grade card with optional header, body, and footer.
 *
 * @example
 * <AppCard title="Recent Orders" headerActions={<Button size="sm">View All</Button>}>
 *   <OrdersList />
 * </AppCard>
 */
export function AppCard({
  children,
  title,
  description,
  headerActions,
  footer,
  noPadding = false,
  className,
}: AppCardProps) {
  const hasHeader = title || description || headerActions;

  return (
    <div
      className={cn(
        "overflow-hidden border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {hasHeader && (
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-base font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="ml-4 flex shrink-0 items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>{children}</div>
      {footer && (
        <div className="border-t border-border px-6 py-4">{footer}</div>
      )}
    </div>
  );
}
