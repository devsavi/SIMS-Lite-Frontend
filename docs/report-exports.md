# Data Export Workflow Documentation

## Overview

The export system enables users to export filtered report datasets in **Excel (.xlsx)**, **CSV (.csv)**, and **PDF (.pdf)** formats directly from backend APIs using binary blob streaming.

## Supported Formats

- **Excel (.xlsx)**: Spreadsheet format containing headers, data formatting, and KPI summary rows.
- **CSV (.csv)**: Lightweight tabular text format for integration with data pipelines.
- **PDF (.pdf)**: Formatted document view for executive distribution.

## Export Workflow

```mermaid
graph TD
    A[User clicks Export Button] --> B[Open ExportDialog Modal]
    B --> C[Select Format: Excel / CSV / PDF]
    C --> D[Toggle KPI Summary Included]
    D --> E[Click Download Report]
    E --> F[Trigger useExportReport Mutation]
    F --> G[API GET /api/v1/reports/:type/export?format=xlsx]
    G --> H{Backend Response}
    H -- Success Blob --> I[Generate Filename with Timestamp]
    I --> J[Trigger Browser Blob Download]
    J --> K[Show Success Feedback & Close Modal]
    H -- Error --> L[Show Toast Error Notification]
```

## Binary Download Utility

The export utility uses `URL.createObjectURL(blob)` to create an in-memory download link, programmatically clicks the link element, and releases object URLs to prevent memory leaks:

```typescript
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
```
