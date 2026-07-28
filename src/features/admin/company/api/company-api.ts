import { get, put, post } from "@/lib/api/client";
import type { CompanyProfile, UpdateCompanyDTO, LogoUploadResponse } from "../types";

const INITIAL_COMPANY: CompanyProfile = {
  id: "comp-1",
  name: "Acme Industrial Solutions Ltd.",
  logoUrl: "",
  address: "100 Innovation Boulevard, Tech Park",
  city: "San Francisco",
  state: "CA",
  postalCode: "94107",
  country: "United States",
  phone: "+1 (555) 234-5678",
  email: "contact@acmeindustrial.com",
  website: "https://acmeindustrial.com",
  taxRegistrationNumber: "TAX-998877665",
  businessRegistrationNumber: "BRN-2026-004921",
  currency: "USD",
  updatedAt: "2026-07-28T10:00:00Z",
};

let localCompanyStore = { ...INITIAL_COMPANY };

export const companyApi = {
  getCompanyProfile: async (): Promise<CompanyProfile> => {
    try {
      return await get<CompanyProfile>("/api/v1/admin/company");
    } catch {
      return localCompanyStore;
    }
  },

  updateCompanyProfile: async (payload: UpdateCompanyDTO): Promise<CompanyProfile> => {
    try {
      return await put<CompanyProfile>("/api/v1/admin/company", payload);
    } catch {
      localCompanyStore = {
        ...localCompanyStore,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return localCompanyStore;
    }
  },

  uploadLogo: async (file: File): Promise<LogoUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      return await post<LogoUploadResponse>("/api/v1/admin/company/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch {
      // Mock local URL output
      const fakeUrl = URL.createObjectURL(file);
      localCompanyStore.logoUrl = fakeUrl;
      return { logoUrl: fakeUrl, filename: file.name };
    }
  },
};
