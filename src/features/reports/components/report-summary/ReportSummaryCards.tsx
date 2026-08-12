"use client";

import * as React from "react";
import { FileText, DollarSign, Layers, Activity } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { useSystemSettingsStore } from "@/stores/settings.store";
import { formatCurrency } from "@/utils/format";
import type { ReportKpiSummary, ReportMetricType } from "../../types";

interface ReportSummaryCardsProps {
  summary?: ReportKpiSummary;
  loading?: boolean;
}

export function ReportSummaryCards({ summary, loading }: ReportSummaryCardsProps) {
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);

  /**
   * Formats a metric value according to its declared type.
   * - "currency" → formatCurrency() using system baseCurrency
   * - "number"   → toLocaleString()
   * - "text"     → render as-is (already formatted string, e.g. "+12.5%")
   */
  function formatMetric(
    value: number | string | undefined,
    type: ReportMetricType = "text"
  ): string {
    if (value == null) return "N/A";
    if (type === "currency" && typeof value === "number") {
      return formatCurrency(value, baseCurrency);
    }
    if (type === "number" && typeof value === "number") {
      return value.toLocaleString();
    }
    return String(value);
  }

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
        value={formatMetric(summary.primaryMetricValue, summary.primaryMetricType)}
        description="Primary summary aggregate"
        icon={<DollarSign className="h-5 w-5" />}
      />

      {summary.secondaryMetricLabel && (
        <StatCard
          label={summary.secondaryMetricLabel}
          value={formatMetric(summary.secondaryMetricValue, summary.secondaryMetricType)}
          icon={<Layers className="h-5 w-5" />}
        />
      )}

      {summary.tertiaryMetricLabel && (
        <StatCard
          label={summary.tertiaryMetricLabel}
          value={formatMetric(summary.tertiaryMetricValue, summary.tertiaryMetricType)}
          icon={<Activity className="h-5 w-5" />}
        />
      )}
    </div>
  );
}
