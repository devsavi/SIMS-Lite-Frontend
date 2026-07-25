import * as React from "react";
import { cn } from "@/utils/cn";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { isApiError } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// ErrorState
// ---------------------------------------------------------------------------

export interface ErrorStateProps {
  /** Heading */
  title?: string;
  /** Supporting description */
  description?: string;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Retry callback */
  onRetry?: () => void;
  /** The raw error object (extracts message if ApiError) */
  error?: unknown;
  className?: string;
}

/**
 * ErrorState — shows when a data-fetch fails.
 *
 * @example
 * <ErrorState error={err} onRetry={refetch} />
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  icon,
  onRetry,
  error,
  className,
}: ErrorStateProps) {
  const errorMessage =
    description ??
    (error && isApiError(error)
      ? error.message
      : error instanceof Error
      ? error.message
      : "An unexpected error occurred. Please try again.");

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center bg-destructive/10 text-destructive">
        {icon ?? <AlertTriangle className="h-8 w-8" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{errorMessage}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NetworkErrorState — specific variant for offline / network errors
// ---------------------------------------------------------------------------

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon={<WifiOff className="h-8 w-8" aria-hidden="true" />}
      title="No connection"
      description="Check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}
