import type { StockReleasePurpose, StockReleaseStatus } from "../types/stock-release-types";

export const STOCK_RELEASE_PURPOSES: StockReleasePurpose[] = [
  "INTERNAL_USE",
  "PRODUCTION",
  "MAINTENANCE",
  "SALES",
  "SAMPLE",
  "DISPOSAL",
  "OTHER",
];

export const STOCK_RELEASE_STATUSES: StockReleaseStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "CANCELLED",
];

export const PURPOSE_LABELS: Record<StockReleasePurpose, string> = {
  INTERNAL_USE: "Internal Use",
  PRODUCTION: "Production",
  MAINTENANCE: "Maintenance",
  SALES: "Sales",
  SAMPLE: "Sample",
  DISPOSAL: "Disposal",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<StockReleaseStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  CANCELLED: "Cancelled",
};
