import * as React from "react";
import { Check, Clock, FileEdit, X, User } from "lucide-react";
import { cn } from "@/utils/cn";
import { normalizeStatus } from "../../utils/stock-release-utils";
import type { StockRelease, ReleaseActor } from "../../types/stock-release-types";

export interface ReleaseTimelineProps {
  release: StockRelease;
  className?: string;
}

interface StepItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp?: string | null;
  actor?: string | null;
  status: "completed" | "active" | "pending" | "cancelled";
  icon: React.ComponentType<{ className?: string }>;
}

function actorFullName(actor?: ReleaseActor | null): string | null {
  if (!actor) return null;
  const name = `${actor.first_name} ${actor.last_name}`.trim();
  return name || actor.email || null;
}

export function ReleaseTimeline({ release, className }: ReleaseTimelineProps) {
  const normStatus = normalizeStatus(release.status);

  const createdDate = release.created_at || release.release_date;
  const createdActor = actorFullName(release.created_by) ?? "User";
  const submittedActor = actorFullName(release.submitted_by) ?? createdActor;
  const approvedActor = actorFullName(release.approved_by) ?? "Store Manager";
  const cancelledActor = actorFullName(release.cancelled_by) ?? "User";

  const steps: StepItem[] = [
    {
      id: "draft",
      title: "Draft Created",
      subtitle: "Stock release request drafted",
      timestamp: createdDate,
      actor: createdActor,
      status: "completed",
      icon: FileEdit,
    },
    {
      id: "submitted",
      title: "Submitted",
      subtitle: normStatus === "DRAFT" ? "Pending submission" : "Submitted for approval",
      timestamp: release.submitted_at,
      actor: normStatus !== "DRAFT" ? submittedActor : null,
      status:
        normStatus === "DRAFT"
          ? "pending"
          : normStatus === "SUBMITTED"
          ? "active"
          : "completed",
      icon: Clock,
    },
    {
      id: "final",
      title: normStatus === "CANCELLED" ? "Cancelled" : "Approved & Stock Deducted",
      subtitle:
        normStatus === "CANCELLED"
          ? release.cancellation_reason
            ? `Reason: ${release.cancellation_reason}`
            : "Release was cancelled"
          : normStatus === "APPROVED"
          ? "Stock balance updated"
          : "Awaiting final approval",
      timestamp:
        normStatus === "CANCELLED"
          ? release.cancelled_at
          : normStatus === "APPROVED"
          ? release.approved_at
          : null,
      actor:
        normStatus === "CANCELLED"
          ? cancelledActor
          : normStatus === "APPROVED"
          ? approvedActor
          : null,
      status:
        normStatus === "CANCELLED"
          ? "cancelled"
          : normStatus === "APPROVED"
          ? "completed"
          : "pending",
      icon: normStatus === "CANCELLED" ? X : Check,
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">
        Workflow & Audit History
      </h3>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex items-start gap-4">
              <div
                className={cn(
                  "absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-none text-white ring-4 ring-background text-[10px] font-bold transition-all",
                  step.status === "completed" && "bg-emerald-600 dark:bg-emerald-500",
                  step.status === "active" && "bg-amber-500 animate-pulse",
                  step.status === "pending" && "bg-muted-foreground/30 text-muted-foreground",
                  step.status === "cancelled" && "bg-rose-600 dark:bg-rose-500"
                )}
              >
                <Icon className="h-3 w-3" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      step.status === "completed" && "text-foreground",
                      step.status === "active" &&
                        "text-amber-600 dark:text-amber-400 font-bold",
                      step.status === "pending" && "text-muted-foreground",
                      step.status === "cancelled" && "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.timestamp && (
                    <time className="text-[11px] text-muted-foreground">
                      {new Date(step.timestamp).toLocaleString()}
                    </time>
                  )}
                </div>

                {step.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.subtitle}</p>
                )}

                {step.actor && (
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground/90">
                    <User className="h-3 w-3" />
                    <span>{step.actor}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed activity log if provided */}
      {release.history && release.history.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Detailed Activity Log</p>
          <div className="space-y-1 text-xs">
            {release.history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
              >
                <span className="font-medium text-foreground">{h.action}</span>
                <span className="text-muted-foreground">
                  {h.actor_name || "User"} •{" "}
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
