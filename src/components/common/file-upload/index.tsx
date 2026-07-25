"use client";

import * as React from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { Upload, X, File as FileIcon, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
  status: "pending" | "uploading" | "done" | "error";
}

export interface FileUploadProps {
  /** Accepted MIME types. E.g. { "image/*": [], "application/pdf": [] } */
  accept?: Accept;
  /** Max file size in bytes. Defaults to 10MB */
  maxSize?: number;
  /** Max number of files. Defaults to 1 */
  maxFiles?: number;
  /** Called when files are accepted */
  onFilesAccepted?: (files: File[]) => void;
  /** Called when files are rejected */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Show image previews */
  imagePreview?: boolean;
  /** Disable the upload area */
  disabled?: boolean;
  /** Files currently in upload state (controlled) */
  files?: UploadedFile[];
  /** Called to remove a file */
  onRemove?: (id: string) => void;
  className?: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FileUpload — drag-and-drop file uploader with preview, progress and validation.
 * Prepared for MinIO integration (pass upload progress via `files` prop).
 *
 * @example
 * <FileUpload
 *   accept={{ "image/*": [] }}
 *   maxFiles={3}
 *   imagePreview
 *   onFilesAccepted={handleUpload}
 * />
 */
export function FileUpload({
  accept,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles = 1,
  onFilesAccepted,
  onFilesRejected,
  imagePreview = false,
  disabled = false,
  files = [],
  onRemove,
  className,
}: FileUploadProps) {
  const [rejectionErrors, setRejectionErrors] = React.useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept,
    maxSize,
    maxFiles,
    disabled,
    onDropAccepted: (accepted) => {
      setRejectionErrors([]);
      onFilesAccepted?.(accepted);
    },
    onDropRejected: (rejections) => {
      const errors = rejections.flatMap((r) =>
        r.errors.map((e) => {
          if (e.code === "file-too-large") return `File too large (max ${formatBytes(maxSize)})`;
          if (e.code === "file-invalid-type") return "Invalid file type";
          if (e.code === "too-many-files") return `Too many files (max ${maxFiles})`;
          return e.message;
        })
      );
      setRejectionErrors([...new Set(errors)]);
      onFilesRejected?.(rejections);
    },
  });

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors",
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && !isDragReject && "border-border hover:border-primary/50 hover:bg-muted/30",
          disabled && "cursor-not-allowed opacity-50"
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Drop files here or click to upload. ${accept ? `Accepted types: ${Object.keys(accept).join(", ")}` : ""}`}
      >
        <input {...getInputProps()} aria-label="File input" />
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Upload className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? "Drop files here…" : "Drag & drop files here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or{" "}
            <span className="font-medium text-primary">click to browse</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {accept
              ? `${Object.keys(accept).join(", ")} — `
              : ""}
            Max {formatBytes(maxSize)}
            {maxFiles > 1 ? `, up to ${maxFiles} files` : ""}
          </p>
        </div>
      </div>

      {/* Rejection errors */}
      {rejectionErrors.length > 0 && (
        <div role="alert" className="space-y-1">
          {rejectionErrors.map((err) => (
            <div
              key={err}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Uploaded files">
          {files.map((f) => {
            const isImage = f.file.type.startsWith("image/");
            return (
              <li
                key={f.id}
                className="flex items-center gap-3 border border-border bg-card p-3"
              >
                {/* Preview / icon */}
                {imagePreview && isImage && f.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="h-10 w-10 shrink-0 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted">
                    {isImage ? (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {f.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(f.file.size)}
                    {f.error && (
                      <span className="ml-2 text-destructive">{f.error}</span>
                    )}
                  </p>
                  {f.status === "uploading" && f.progress !== undefined && (
                    <Progress value={f.progress} className="mt-1 h-1" />
                  )}
                </div>

                {/* Status / remove */}
                <div className="flex shrink-0 items-center gap-2">
                  {f.status === "uploading" && (
                    <Loader2
                      className="h-4 w-4 animate-spin text-muted-foreground"
                      aria-label="Uploading"
                    />
                  )}
                  {onRemove && f.status !== "uploading" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={`Remove ${f.file.name}`}
                      onClick={() => onRemove(f.id)}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
