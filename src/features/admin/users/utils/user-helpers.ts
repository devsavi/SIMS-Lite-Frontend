import type { UserRole } from "@/lib/auth";
import type { UserStatus } from "../types";

export function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case "admin":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300";
    case "officer":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
    case "store_keeper":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}


export function getStatusBadgeClass(status: UserStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200";
    case "INACTIVE":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "Never";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}
