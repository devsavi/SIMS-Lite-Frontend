import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { emailApi } from "../api/email-api";
import type { UpdateEmailConfigDTO, TestConnectionDTO } from "../types";

export const emailKeys = {
  config: ["email-config"] as const,
};

export function useEmailConfig() {
  return useQuery({
    queryKey: emailKeys.config,
    queryFn: () => emailApi.getEmailConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateEmailConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEmailConfigDTO) => emailApi.updateEmailConfig(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(emailKeys.config, updated);
      queryClient.invalidateQueries({ queryKey: emailKeys.config });
    },
  });
}

export function useTestEmailConnection() {
  return useMutation({
    mutationFn: (payload: TestConnectionDTO) => emailApi.testConnection(payload),
  });
}
