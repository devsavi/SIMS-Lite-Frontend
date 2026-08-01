import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Status variants
// ---------------------------------------------------------------------------

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border",
  {
    variants: {
      variant: {
        // General
        active:
          "bg-[#D1F5E0] text-[#0F9D58] border-[#A6E9C4] dark:bg-[rgba(46,204,113,0.15)] dark:text-[#4ADE80] dark:border-[rgba(74,222,128,0.4)]",
        inactive:
          "bg-[#F1F1F1] text-[#6B6B6B] border-[#DADADA] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#9CA3AF] dark:border-[rgba(156,163,175,0.35)]",
        pending:
          "bg-[#FFF3D6] text-[#B9791A] border-[#FCE3A0] dark:bg-[rgba(251,191,36,0.15)] dark:text-[#FBBF24] dark:border-[rgba(251,191,36,0.4)]",
        approved: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50",
        rejected:
          "bg-[#FDE2E2] text-[#C0362C] border-[#F8C1BC] dark:bg-[rgba(248,113,113,0.15)] dark:text-[#F87171] dark:border-[rgba(248,113,113,0.4)]",
        draft: "bg-[#F1F1F1] text-[#6B6B6B] border-[#DADADA] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#9CA3AF] dark:border-[rgba(156,163,175,0.35)]",
        cancelled: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50",
        // Inventory
        "in-stock":
          "bg-[#D1F5E0] text-[#0F9D58] border-[#A6E9C4] dark:bg-[rgba(46,204,113,0.15)] dark:text-[#4ADE80] dark:border-[rgba(74,222,128,0.4)]",
        "low-stock":
          "bg-[#FFF3D6] text-[#B9791A] border-[#FCE3A0] dark:bg-[rgba(251,191,36,0.15)] dark:text-[#FBBF24] dark:border-[rgba(251,191,36,0.4)]",
        "out-of-stock":
          "bg-[#FDE2E2] text-[#C0362C] border-[#F8C1BC] dark:bg-[rgba(248,113,113,0.15)] dark:text-[#F87171] dark:border-[rgba(248,113,113,0.4)]",
        // Notifications
        info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50",
        success:
          "bg-[#D1F5E0] text-[#0F9D58] border-[#A6E9C4] dark:bg-[rgba(46,204,113,0.15)] dark:text-[#4ADE80] dark:border-[rgba(74,222,128,0.4)]",
        warning:
          "bg-[#FFF3D6] text-[#B9791A] border-[#FCE3A0] dark:bg-[rgba(251,191,36,0.15)] dark:text-[#FBBF24] dark:border-[rgba(251,191,36,0.4)]",
        error:
          "bg-[#FDE2E2] text-[#C0362C] border-[#F8C1BC] dark:bg-[rgba(248,113,113,0.15)] dark:text-[#F87171] dark:border-[rgba(248,113,113,0.4)]",
        // Neutral
        default: "bg-secondary text-secondary-foreground border-transparent",
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
  active: "bg-[#0F9D58] dark:bg-[#4ADE80]",
  inactive: "bg-[#6B6B6B] dark:bg-[#9CA3AF]",
  pending: "bg-[#B9791A] dark:bg-[#FBBF24]",
  approved: "bg-blue-500 dark:bg-blue-400",
  rejected: "bg-[#C0362C] dark:bg-[#F87171]",
  draft: "bg-[#6B6B6B] dark:bg-[#9CA3AF]",
  cancelled: "bg-orange-500 dark:bg-orange-400",
  "in-stock": "bg-[#0F9D58] dark:bg-[#4ADE80]",
  "low-stock": "bg-[#B9791A] dark:bg-[#FBBF24]",
  "out-of-stock": "bg-[#C0362C] dark:bg-[#F87171]",
  info: "bg-blue-500 dark:bg-blue-400",
  success: "bg-[#0F9D58] dark:bg-[#4ADE80]",
  warning: "bg-[#B9791A] dark:bg-[#FBBF24]",
  error: "bg-[#C0362C] dark:bg-[#F87171]",
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
