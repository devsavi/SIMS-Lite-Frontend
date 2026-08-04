import type { StockReleaseStatus, StockReleasePurpose, StockReleaseItem } from "../types/stock-release-types";
import type { UserRole } from "@/lib/auth";

export function normalizeStatus(status?: string): StockReleaseStatus {
  if (!status) return "DRAFT";
  const s = status.toUpperCase();
  if (s === "SUBMITTED") return "SUBMITTED";
  if (s === "APPROVED") return "APPROVED";
  if (s === "CANCELLED" || s === "CANCELED" || s === "REJECTED") return "CANCELLED";
  return "DRAFT";
}

export function getStatusBadgeVariant(
  status: StockReleaseStatus | string
): "default" | "secondary" | "success" | "destructive" | "outline" | "warning" {
  const norm = normalizeStatus(status);
  switch (norm) {
    case "DRAFT":
      return "secondary";
    case "SUBMITTED":
      return "warning";
    case "APPROVED":
      return "success";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

export function getStatusLabel(status: StockReleaseStatus | string): string {
  const norm = normalizeStatus(status);
  switch (norm) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "APPROVED":
      return "Approved";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function getPurposeLabel(purpose: StockReleasePurpose | string): string {
  switch (purpose) {
    case "INTERNAL_USE":
      return "Internal Use";
    case "PRODUCTION":
      return "Production";
    case "MAINTENANCE":
      return "Maintenance";
    case "SALES":
      return "Sales";
    case "SAMPLE":
      return "Sample";
    case "DISPOSAL":
      return "Disposal";
    case "OTHER":
      return "Other";
    default:
      return purpose;
  }
}

export function calculateTotalQuantity(items: StockReleaseItem[] = []): number {
  return items.reduce((sum, item) => sum + (Number(item.quantity_requested) || 0), 0);
}

export function canEditRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "DRAFT") return false;
  if (!userRole) return false;
  const role = (userRole as string).toLowerCase();
  return role === "admin" || role === "store_keeper";
}

export function canDeleteRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  return canEditRelease(status, userRole);
}

export function canSubmitRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "DRAFT") return false;
  if (!userRole) return false;
  const role = (userRole as string).toLowerCase();
  return role === "admin" || role === "store_keeper";
}

export function canApproveRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "SUBMITTED") return false;
  if (!userRole) return false;
  const role = (userRole as string).toLowerCase();
  return role === "admin" || role === "store_keeper";
}

export function canCancelRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "DRAFT" && norm !== "SUBMITTED") return false;
  if (!userRole) return false;
  const role = (userRole as string).toLowerCase();
  return role === "admin" || role === "store_keeper";
}
