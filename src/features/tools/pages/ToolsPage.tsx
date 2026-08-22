"use client";

import React, { useState } from "react";
import { Wrench, Calculator, StickyNote, FileSpreadsheet } from "lucide-react";
import { CalculatorsSection } from "../components/CalculatorsSection";
import { OfficeUtilitiesSection } from "../components/OfficeUtilitiesSection";
import { SummarySheetsSection } from "../components/SummarySheetsSection";

type MainTab = "calculators" | "office" | "summary-sheets";

const TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: "calculators", label: "Business Calculators", icon: <Calculator className="w-4 h-4" /> },
  { key: "office", label: "Office & Productivity Utilities", icon: <StickyNote className="w-4 h-4" /> },
  { key: "summary-sheets", label: "Office Summary Sheets", icon: <FileSpreadsheet className="w-4 h-4" /> },
];

export function ToolsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("calculators");

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="w-7 h-7 text-primary" />
            Tools & Office Utilities Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access business calculators, daily shift summary sheets, barcode generators, and office productivity tools.
          </p>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-border pb-3">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMainTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all ${
              mainTab === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-foreground border border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Main Tab Panels */}
      {mainTab === "calculators" && <CalculatorsSection />}
      {mainTab === "office" && <OfficeUtilitiesSection />}
      {mainTab === "summary-sheets" && <SummarySheetsSection />}
    </div>
  );
}
