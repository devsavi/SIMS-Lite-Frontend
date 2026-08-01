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
      return "bg-[#D1F5E0] text-[#0F9D58] border-[#A6E9C4] dark:bg-[rgba(46,204,113,0.15)] dark:text-[#4ADE80] dark:border-[rgba(74,222,128,0.4)]";
    case "INACTIVE":
      return "bg-[#F1F1F1] text-[#6B6B6B] border-[#DADADA] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#9CA3AF] dark:border-[rgba(156,163,175,0.35)]";
    case "PENDING":
      return "bg-[#FFF3D6] text-[#B9791A] border-[#FCE3A0] dark:bg-[rgba(251,191,36,0.15)] dark:text-[#FBBF24] dark:border-[rgba(251,191,36,0.4)]";
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
