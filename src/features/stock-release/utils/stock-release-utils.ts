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
  // ADMIN: full access | STORE_KEEPER: inventory:write | OFFICER: no edit
  return (
    role === "admin" ||
    role === "store_keeper"
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
  // ADMIN: full access | STORE_KEEPER: inventory:write | OFFICER: no submit
  return (
    role === "admin" ||
    role === "store_keeper"
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
  // ADMIN: inventory:approve | STORE_KEEPER: inventory:approve | OFFICER: no approve
  return (
    role === "admin" ||
    role === "store_keeper"
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
  // ADMIN: full access | STORE_KEEPER: inventory:write | OFFICER: no cancel
  return (
    role === "admin" ||
    role === "store_keeper"
  );
}

