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
  FileSpreadsheet,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { ReportMeta, ReportType } from "../../types";


interface ReportsCategoryHubProps {
  reports: ReportMeta[];
  onQuickExport: (report: ReportMeta, format: "excel" | "pdf") => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Archive: <Archive className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
  AlertTriangle: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  ShoppingCart: <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  ClipboardCheck: <ClipboardCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
  ArrowUpFromLine: <ArrowUpFromLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
  TrendingUp: <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
  Truck: <Truck className="h-5 w-5 text-amber-700 dark:text-amber-300" />,
  Package: <Package className="h-5 w-5 text-slate-700 dark:text-slate-300" />,
};

const CATEGORY_TITLES: Record<string, string> = {
  inventory: "1. Inventory & Stock Analytics",
  procurement: "2. Procurement & Receiving Operations",
  "master-data": "3. Master Data & Product Catalog",
};

export function ReportsCategoryHub({ reports, onQuickExport }: ReportsCategoryHubProps) {
  const groupedReports = React.useMemo(() => {
    const map: Record<string, ReportMeta[]> = {
      inventory: [],
      procurement: [],
      "master-data": [],
    };
    reports.forEach((r) => {
      if (map[r.category]) {
        map[r.category].push(r);
      } else {
        map.inventory.push(r);
      }
    });
    return map;
  }, [reports]);

  return (
    <div className="space-y-8">
      {Object.entries(groupedReports).map(([catKey, categoryReports]) => {
        if (categoryReports.length === 0) return null;
        return (
          <div key={catKey} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              {CATEGORY_TITLES[catKey] || catKey}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categoryReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-card border border-border rounded-none p-5 shadow-xs flex flex-col justify-between hover:border-primary transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-muted rounded-none">
                        {ICON_MAP[report.iconName] || <Package className="h-5 w-5" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-secondary text-secondary-foreground border border-border">
                        {report.id}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {report.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60 space-y-3">
                    {/* Quick Download Actions */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onQuickExport(report, "excel")}
                        className="h-7 text-[11px] px-2 gap-1 flex-1 rounded-none border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                        Excel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onQuickExport(report, "pdf")}
                        className="h-7 text-[11px] px-2 gap-1 flex-1 rounded-none border-blue-600/30 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        PDF
                      </Button>
                    </div>

                    {/* Drill-down detail link */}
                    <Link
                      href={`/reports/${report.id}`}
                      className="inline-flex items-center justify-between w-full text-xs font-semibold text-primary hover:underline pt-1"
                    >
                      <span>Explore Full Data Table</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
