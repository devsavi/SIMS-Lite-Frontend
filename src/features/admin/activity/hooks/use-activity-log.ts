import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api/activity-api";
import type { ActivityFilterParams } from "../types";

export const activityKeys = {
  all: ["activity-logs"] as const,
  list: (filters?: ActivityFilterParams) => [...activityKeys.all, "list", filters] as const,
};

export function useActivityLogs(filters?: ActivityFilterParams) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => activityApi.getActivityLogs(filters),
    staleTime: 60 * 1000,
  });
}
