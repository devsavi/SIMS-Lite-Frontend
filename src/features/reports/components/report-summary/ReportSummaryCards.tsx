"use client";

import * as React from "react";
import { FileText, DollarSign, Layers, Activity } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import type { ReportKpiSummary } from "../../types";

interface ReportSummaryCardsProps {
  summary?: ReportKpiSummary;
  loading?: boolean;
}

export function ReportSummaryCards({ summary, loading }: ReportSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} label="Loading..." value="..." loading />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Records"
        value={summary.totalRecords.toLocaleString()}
        description="Filtered dataset size"
        icon={<FileText className="h-5 w-5" />}
      />

      <StatCard
        label={summary.primaryMetricLabel}
        value={summary.primaryMetricValue}
        description="Primary summary aggregate"
        icon={<DollarSign className="h-5 w-5" />}
      />

      {summary.secondaryMetricLabel && (
        <StatCard
          label={summary.secondaryMetricLabel}
          value={summary.secondaryMetricValue ?? "N/A"}
          icon={<Layers className="h-5 w-5" />}
        />
      )}

      {summary.tertiaryMetricLabel && (
        <StatCard
          label={summary.tertiaryMetricLabel}
          value={summary.tertiaryMetricValue ?? "N/A"}
          icon={<Activity className="h-5 w-5" />}
        />
      )}
    </div>
  );
}
