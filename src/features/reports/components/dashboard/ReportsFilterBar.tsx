"use client";

import * as React from "react";
import { Calendar, Download, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import type { ReportPeriod } from "../../types";

interface ReportsFilterBarProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onRefresh: () => void;
  onExportAll: (format: "excel" | "pdf") => void;
  isExporting?: boolean;
}

export function ReportsFilterBar({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRefresh,
  onExportAll,
  isExporting = false,
}: ReportsFilterBarProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-none shadow-xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
      {/* Left: Period Segmented Control */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mr-2">
          <Filter className="h-3.5 w-3.5" /> Date Filter:
        </span>
        <div className="inline-flex p-1 bg-muted rounded-none border border-border">
          {(
            [
              { id: "day", label: "Today (Default)" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "custom", label: "Custom Range" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPeriodChange(item.id)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                period === item.id
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex items-center gap-1.5 bg-background border border-border px-2 py-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onStartDateChange(e.target.value)}
                className="h-6 text-xs border-0 p-0 focus-visible:ring-0 w-28 bg-transparent"
              />
            </div>
            <span className="text-xs text-muted-foreground">to</span>
            <div className="flex items-center gap-1.5 bg-background border border-border px-2 py-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEndDateChange(e.target.value)}
                className="h-6 text-xs border-0 p-0 focus-visible:ring-0 w-28 bg-transparent"
              />
            </div>
          </div>
        )}
      </div>


      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 text-xs gap-1.5 rounded-none"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={isExporting}
          onClick={() => onExportAll("excel")}
          className="h-8 text-xs gap-1.5 rounded-none"
        >
          <Download className="h-3.5 w-3.5 text-emerald-600" />
          Excel Summary
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={isExporting}
          onClick={() => onExportAll("pdf")}
          className="h-8 text-xs gap-1.5 rounded-none"
        >
          <Download className="h-3.5 w-3.5" />
          PDF Report
        </Button>
      </div>
    </div>
  );
}
