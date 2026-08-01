import * as React from "react";
import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

export interface StatCardTrend {
  value: number;  // percentage change (positive = up, negative = down)
  label?: string; // e.g. "vs last month"
}

export interface StatCardProps {
  /** Label above the number */
  label: string;
  /** The primary metric value */
  value: string | number;
  /** Optional small description below the value */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional trend data */
  trend?: StatCardTrend;
  /** Loading state */
  loading?: boolean;
  className?: string;
}

/**
 * StatCard — KPI/metric card for dashboards.
 *
 * @example
 * <StatCard
 *   label="Total Products"
 *   value="1,284"
 *   trend={{ value: 12, label: "vs last month" }}
 *   icon={<Package className="h-5 w-5" />}
 * />
 */
export function StatCard({
  label,
  value,
  description,
  icon,
  trend,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("border border-border bg-card p-6 shadow-sm", className)}>
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse bg-muted" />
          <div className="h-8 w-32 animate-pulse bg-muted" />
          <div className="h-3 w-20 animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  const trendColor =
    trend === undefined
      ? ""
      : trend.value > 0
      ? "text-green-600 dark:text-green-400"
      : trend.value < 0
      ? "text-destructive"
      : "text-muted-foreground";

  const TrendIcon =
    trend === undefined
      ? null
      : trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus;

  return (
    <div
      className={cn(
        "border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend !== undefined && TrendIcon && (
            <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
                {trend.label && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    {trend.label}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
