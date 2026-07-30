import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "../api/activity-api";
import type { AuditLogFilterParams } from "../types";

export const auditLogKeys = {
  all: ["admin-audit-logs"] as const,
  list: (filters: AuditLogFilterParams) => [...auditLogKeys.all, "list", filters] as const,
};

export function useAdminAuditLogs(filters: AuditLogFilterParams) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => auditLogsApi.getAuditLogs(filters),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
