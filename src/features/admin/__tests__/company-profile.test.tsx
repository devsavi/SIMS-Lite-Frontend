import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCompanyProfile, useUpdateCompanyProfile } from "../company/hooks/use-company-profile";
import { companyApi } from "../company/api/company-api";
import { CompanyProfileForm } from "../company/components/CompanyProfileForm";
import { LogoUploader } from "../company/components/LogoUploader";
import type { CompanyProfile } from "../company/types";

vi.mock("../company/api/company-api", () => ({
  companyApi: {
    getCompanyProfile: vi.fn(),
    updateCompanyProfile: vi.fn(),
    uploadLogo: vi.fn(),
  },
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ role: "admin", isAuthenticated: true }),
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

const mockProfile: CompanyProfile = {
  id: "comp-1",
  name: "Acme Corp",
  logoUrl: "",
  address: "100 Main Street",
  city: "San Francisco",
  state: "CA",
  postalCode: "94107",
  country: "United States",
  phone: "+1 555-1234",
  email: "info@acme.com",
  website: "https://acme.com",
  taxRegistrationNumber: "TAX-12345",
  businessRegistrationNumber: "BRN-67890",
  currency: "USD",
  updatedAt: "2026-07-28T10:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// useCompanyProfile Hook
// =============================================================================

describe("useCompanyProfile hook", () => {
  it("fetches company profile successfully", async () => {
    vi.mocked(companyApi.getCompanyProfile).mockResolvedValue(mockProfile);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCompanyProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Acme Corp");
    expect(result.current.data?.currency).toBe("USD");
  });
});

// =============================================================================
// useUpdateCompanyProfile Mutation
// =============================================================================

describe("useUpdateCompanyProfile mutation", () => {
  it("updates company profile via API", async () => {
    const updatedProfile = { ...mockProfile, name: "Acme Industrial Ltd." };
    vi.mocked(companyApi.updateCompanyProfile).mockResolvedValue(updatedProfile);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateCompanyProfile(), { wrapper });

    result.current.mutate({
      name: "Acme Industrial Ltd.",
      address: mockProfile.address,
      city: mockProfile.city,
      state: mockProfile.state,
      postalCode: mockProfile.postalCode,
      country: mockProfile.country,
      phone: mockProfile.phone,
      email: mockProfile.email,
      website: mockProfile.website,
      taxRegistrationNumber: mockProfile.taxRegistrationNumber,
      businessRegistrationNumber: mockProfile.businessRegistrationNumber,
      currency: mockProfile.currency,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(companyApi.updateCompanyProfile).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Acme Industrial Ltd." })
    );
  });
});

// =============================================================================
// CompanyProfileForm Component
// =============================================================================

describe("CompanyProfileForm component", () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  it("renders all required form fields", () => {
    render(
      <CompanyProfileForm
        profile={mockProfile}
        onSave={mockOnSave}
        isSubmitting={false}
      />
    );

    expect(screen.getByDisplayValue("Acme Corp")).toBeInTheDocument();
    expect(screen.getByDisplayValue("info@acme.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+1 555-1234")).toBeInTheDocument();
    expect(screen.getByDisplayValue("San Francisco")).toBeInTheDocument();
    expect(screen.getByDisplayValue("United States")).toBeInTheDocument();
  });

  it("displays save button with correct label", () => {
    render(
      <CompanyProfileForm
        profile={mockProfile}
        onSave={mockOnSave}
        isSubmitting={false}
      />
    );
    expect(screen.getByText("Save Company Profile")).toBeInTheDocument();
  });

  it("shows submitting state when isSubmitting is true", () => {
    render(
      <CompanyProfileForm
        profile={mockProfile}
        onSave={mockOnSave}
        isSubmitting={true}
      />
    );
    expect(screen.getByText("Saving Company Profile...")).toBeInTheDocument();
  });
});

// =============================================================================
// LogoUploader Component
// =============================================================================

describe("LogoUploader component", () => {
  it("renders upload button", () => {
    render(
      <LogoUploader
        currentLogoUrl=""
        onUploadLogo={vi.fn()}
        isUploading={false}
      />
    );
    expect(screen.getByText("Upload Logo")).toBeInTheDocument();
    expect(screen.getByText("Company Branding Logo")).toBeInTheDocument();
  });

  it("shows uploading state when isUploading is true", () => {
    render(
      <LogoUploader
        currentLogoUrl=""
        onUploadLogo={vi.fn()}
        isUploading={true}
      />
    );
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
  });
});
