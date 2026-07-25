"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExportFormat = "csv" | "xlsx" | "pdf" | "json";

export interface ExportButtonProps {
  /** Formats to offer. Defaults to ["csv", "xlsx"] */
  formats?: ExportFormat[];
  /** Called when the user picks a format */
  onExport: (format: ExportFormat) => void | Promise<void>;
  /** Disable the button (e.g. when loading) */
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "Export as CSV",
  xlsx: "Export as Excel",
  pdf: "Export as PDF",
  json: "Export as JSON",
};

/**
 * ExportButton — dropdown that lets the user choose an export format.
 *
 * @example
 * <ExportButton formats={["csv", "xlsx"]} onExport={handleExport} />
 */
export function ExportButton({
  formats = ["csv", "xlsx"],
  onExport,
  disabled,
  loading,
  className,
}: ExportButtonProps) {
  const [exporting, setExporting] = React.useState(false);

  async function handleSelect(fmt: ExportFormat) {
    setExporting(true);
    try {
      await onExport(fmt);
    } finally {
      setExporting(false);
    }
  }

  if (formats.length === 1) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || loading || exporting}
        onClick={() => handleSelect(formats[0])}
        className={cn("gap-2", className)}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {exporting ? "Exporting…" : "Export"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || loading || exporting}
          className={cn("gap-2", className)}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {exporting ? "Exporting…" : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((fmt) => (
          <DropdownMenuItem key={fmt} onClick={() => handleSelect(fmt)}>
            {FORMAT_LABELS[fmt]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
