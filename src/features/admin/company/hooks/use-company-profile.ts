import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "../api/company-api";
import type { UpdateCompanyDTO } from "../types";

export const companyKeys = {
  profile: ["company-profile"] as const,
};

export function useCompanyProfile() {
  return useQuery({
    queryKey: companyKeys.profile,
    queryFn: () => companyApi.getCompanyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCompanyDTO) => companyApi.updateCompanyProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(companyKeys.profile, updated);
      queryClient.invalidateQueries({ queryKey: companyKeys.profile });
    },
  });
}

export function useUploadCompanyLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => companyApi.uploadLogo(file),
    onSuccess: (result) => {
      queryClient.setQueryData(companyKeys.profile, (old: any) =>
        old ? { ...old, logoUrl: result.logoUrl } : old
      );
      queryClient.invalidateQueries({ queryKey: companyKeys.profile });
    },
  });
}
