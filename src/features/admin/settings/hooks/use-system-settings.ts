import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings-api";
import type { SystemSettingsConfig } from "../types";

export const settingsKeys = {
  all: ["system-settings"] as const,
};

export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => settingsApi.getSystemSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettingsSection<K extends keyof Omit<SystemSettingsConfig, "updatedAt">>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ section, data }: { section: K; data: SystemSettingsConfig[K] }) =>
      settingsApi.updateSectionSettings(section, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsKeys.all, updated);
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
