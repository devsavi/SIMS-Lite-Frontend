import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings-api";
import type { UpdateSystemSettingsDTO } from "../types";

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

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSystemSettingsDTO) => settingsApi.updateSystemSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsKeys.all, updated);
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
