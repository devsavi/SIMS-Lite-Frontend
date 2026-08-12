import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { emailApi } from "../api/email-api";
import type { TestConnectionPayload, UpdateEmailConfigDTO } from "../types";

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

/**
 * Mutation hook to test the SMTP email connection by sending a test message.
 */
export function useTestEmailConnection() {
  return useMutation({
    mutationFn: (payload: TestConnectionPayload | string) => emailApi.testConnection(payload),
  });
}
