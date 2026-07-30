import { get, patch } from "@/lib/api/client";
import type { CompanyProfile, UpdateCompanyDTO } from "../types";

interface CompanyProfileResponse {
  status: string;
  data: CompanyProfile;
}

export const companyApi = {
  getCompanyProfile: async (): Promise<CompanyProfile> => {
    const response = await get<CompanyProfileResponse>("/settings/company-profile");
    return response.data;
  },

  updateCompanyProfile: async (payload: UpdateCompanyDTO): Promise<CompanyProfile> => {
    const response = await patch<CompanyProfileResponse>("/settings/company-profile", payload);
    return response.data;
  },
};
