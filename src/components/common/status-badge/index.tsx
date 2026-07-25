import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Status variants
// ---------------------------------------------------------------------------

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        // General
        active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        cancelled: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        // Inventory
        "in-stock": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        "low-stock": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        "out-of-stock": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        // Notifications
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        // Neutral
        default: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ---------------------------------------------------------------------------
// Dot indicator colours
// ---------------------------------------------------------------------------

const dotColours: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  rejected: "bg-red-500",
  draft: "bg-gray-400",
  cancelled: "bg-orange-500",
  "in-stock": "bg-green-500",
  "low-stock": "bg-yellow-500",
  "out-of-stock": "bg-red-500",
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  default: "bg-muted-foreground",
};

// ---------------------------------------------------------------------------
// StatusBadge component
// ---------------------------------------------------------------------------

export type StatusVariant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>;

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof statusBadgeVariants> {
  /** Show a coloured dot indicator */
  dot?: boolean;
  /** Custom label (defaults to the variant name formatted as Title Case) */
  label?: string;
}

function formatLabel(variant: string): string {
  return variant
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * StatusBadge — a coloured badge indicating record status.
 *
 * @example
 * <StatusBadge variant="active" />
 * <StatusBadge variant="low-stock" dot />
 * <StatusBadge variant="pending" label="Awaiting Review" />
 */
export function StatusBadge({
  variant = "default",
  dot = false,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  const displayLabel = label ?? formatLabel(String(variant));
  const dotClass = dotColours[String(variant)] ?? "bg-muted-foreground";

  return (
    <span
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotClass)}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Convenience type exports
// ---------------------------------------------------------------------------
export type { StatusVariant as BadgeVariant };
