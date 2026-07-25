import * as React from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export interface SectionProps {
  children: React.ReactNode;
  /** Section heading */
  title?: string;
  /** Optional description */
  description?: string;
  /** Slot for section-level actions */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Section — a labelled content region within a page.
 *
 * @example
 * <Section title="Billing Information" description="Manage your payment method">
 *   <BillingForm />
 * </Section>
 */
export function Section({
  children,
  title,
  description,
  actions,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
