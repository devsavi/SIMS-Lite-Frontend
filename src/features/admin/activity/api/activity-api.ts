import { get } from "@/lib/api/client";
import type {
  AuditLogFilterParams,
  AuditLogApiResponse,
  AuditLogEntry,
} from "../types";

function buildQueryParams(params: AuditLogFilterParams): Record<string, any> {
  const query: Record<string, any> = {
    page: params.page,
    size: params.size,
  };

  // Period
  if (params.period !== "custom") {
    query.period = params.period;
  } else {
    if (params.date_from) query.date_from = params.date_from;
    if (params.date_to) query.date_to = params.date_to;
  }

  // Action category
  if (params.action !== "all") query.action = params.action;

  // User filter
  if (params.user_id) query.user_id = params.user_id;

  // Resource type
  if (params.resource_type !== "all") query.resource_type = params.resource_type;

  return query;
}

export const auditLogsApi = {
  getAuditLogs: async (params: AuditLogFilterParams): Promise<AuditLogApiResponse> => {
    const query = buildQueryParams(params);
    const res = await get<AuditLogApiResponse>("/admin/audit-logs/", { params: query });
    return {
      status: res.status ?? "success",
      data: Array.isArray(res?.data) ? res.data : [],
      pagination: res?.pagination ?? { page: 1, size: params.size, total: 0, pages: 1 },
    };
  },
};
