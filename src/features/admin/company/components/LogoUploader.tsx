"use client";

import React from "react";
import { Upload, Building2, CheckCircle2 } from "lucide-react";

interface LogoUploaderProps {
  currentLogoUrl?: string;
  onUploadLogo: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function LogoUploader({ currentLogoUrl, onUploadLogo, isUploading }: LogoUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadLogo(file);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 relative overflow-hidden">
        {currentLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentLogoUrl}
            alt="Company Logo"
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <Building2 className="h-10 w-10 text-muted-foreground/60" />
        )}
      </div>

      <div className="space-y-2 text-center sm:text-left">
        <h4 className="text-sm font-semibold text-foreground">Company Branding Logo</h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          Upload your official company emblem. High-resolution PNG or SVG formats recommended (max 2MB).
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {isUploading ? "Uploading..." : "Upload Logo"}
          </button>

          {successMsg && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Logo updated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
