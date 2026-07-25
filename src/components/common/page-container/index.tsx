import * as React from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// PageContainer
// ---------------------------------------------------------------------------

export interface PageContainerProps {
  children: React.ReactNode;
  /** Controls max-width constraint. Defaults to "full". */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

/**
 * PageContainer — wraps page content with consistent spacing and optional max-width.
 *
 * @example
 * <PageContainer>
 *   <PageHeader title="Dashboard" />
 *   <StatCards />
 * </PageContainer>
 */
export function PageContainer({
  children,
  maxWidth = "full",
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
