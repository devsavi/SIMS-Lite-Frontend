import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/audit-api";
import type { AuditFilterParams } from "../types";

export const auditKeys = {
  all: ["audit-trail"] as const,
  list: (filters?: AuditFilterParams) => [...auditKeys.all, "list", filters] as const,
};

export function useAuditTrail(filters?: AuditFilterParams) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => auditApi.getAuditRecords(filters),
    staleTime: 60 * 1000,
  });
}
