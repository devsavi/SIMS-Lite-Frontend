import type { StockReleaseStatus, StockReleaseItem } from "../types/stock-release-types";
import type { UserRole } from "@/lib/auth";

export function normalizeStatus(status?: string): StockReleaseStatus {
  if (!status) return "draft";
  const s = status.toLowerCase();
  if (s === "submitted") return "submitted";
  if (s === "approved") return "approved";
  if (s === "cancelled" || s === "canceled" || s === "rejected") return "cancelled";
  return "draft";
}

export function getStatusBadgeVariant(
  status: StockReleaseStatus | string
): "default" | "secondary" | "success" | "destructive" | "outline" | "warning" {
  const norm = normalizeStatus(status);
  switch (norm) {
    case "draft":
      return "secondary";
    case "submitted":
      return "warning";
    case "approved":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export function getStatusLabel(status: StockReleaseStatus | string): string {
  const norm = normalizeStatus(status);
  switch (norm) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function calculateTotalQuantity(items: StockReleaseItem[] = []): number {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function canEditRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "draft") return false;
  if (!userRole) return false;
  const role = userRole.toLowerCase();
  return (
    role === "admin" ||
    role === "super_admin" ||
    role === "officer" ||
    role === "procurement_officer" ||
    role === "store_keeper" ||
    role === "stock_clerk" ||
    role === "warehouse_manager"
  );
}

export function canSubmitRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "draft") return false;
  if (!userRole) return false;
  const role = userRole.toLowerCase();
  return (
    role === "admin" ||
    role === "super_admin" ||
    role === "officer" ||
    role === "procurement_officer" ||
    role === "store_keeper" ||
    role === "stock_clerk" ||
    role === "warehouse_manager"
  );
}

export function canApproveRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "submitted") return false;
  if (!userRole) return false;
  const role = userRole.toLowerCase();
  return (
    role === "admin" ||
    role === "super_admin" ||
    role === "warehouse_manager"
  );
}

export function canCancelRelease(
  status: StockReleaseStatus | string,
  userRole?: UserRole | string
): boolean {
  const norm = normalizeStatus(status);
  if (norm !== "draft" && norm !== "submitted") return false;
  if (!userRole) return false;
  const role = userRole.toLowerCase();
  return (
    role === "admin" ||
    role === "super_admin" ||
    role === "officer" ||
    role === "procurement_officer" ||
    role === "store_keeper" ||
    role === "stock_clerk" ||
    role === "warehouse_manager"
  );
}
