"use client";

import * as React from "react";
import Link from "next/link";
import {
  Archive,
  AlertTriangle,
  ShoppingCart,
  ClipboardCheck,
  ArrowUpFromLine,
  TrendingUp,
  Truck,
  Package,
  Eye,
  Download,
  Calendar,
} from "lucide-react";
import { AppCard } from "@/components/common/app-card";
import { StatusBadge } from "@/components/common/status-badge";
import type { ReportMeta } from "../../types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Archive,
  AlertTriangle,
  ShoppingCart,
  ClipboardCheck,
  ArrowUpFromLine,
  TrendingUp,
  Truck,
  Package,
};

interface ReportCardProps {
  report: ReportMeta;
  onQuickExport: (report: ReportMeta) => void;
}

export function ReportCard({ report, onQuickExport }: ReportCardProps) {
  const IconComponent = ICON_MAP[report.iconName] || Archive;

  return (
    <AppCard
      className="flex flex-col justify-between p-5 transition-all hover:shadow-md border border-border"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base line-clamp-1">
                {report.title}
              </h3>
              <StatusBadge
                variant="default"
                label={report.category}
                className="capitalize text-xs mt-0.5"
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {report.description}
        </p>
      </div>

      <div className="pt-3 border-t border-border/60">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            Last: {report.lastGenerated || "N/A"}
          </span>
          <span className="font-medium uppercase text-[10px] tracking-wider text-muted-foreground/80">
            {report.supportedFormats.join(" • ")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/reports/${report.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Eye className="h-3.5 w-3.5" />
            View Report
          </Link>
          <button
            type="button"
            onClick={() => onQuickExport(report)}
            aria-label={`Export ${report.title}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-input bg-background hover:bg-accent text-accent-foreground rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>
    </AppCard>
  );
}
