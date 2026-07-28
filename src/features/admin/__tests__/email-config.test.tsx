import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEmailConfig, useUpdateEmailConfig, useTestEmailConnection } from "../email/hooks/use-email-config";
import { emailApi } from "../email/api/email-api";
import { EmailConfigForm } from "../email/components/EmailConfigForm";
import { TestConnectionModal } from "../email/components/TestConnectionModal";
import type { EmailConfig } from "../email/types";

vi.mock("../email/api/email-api", () => ({
  emailApi: {
    getEmailConfig: vi.fn(),
    updateEmailConfig: vi.fn(),
    testConnection: vi.fn(),
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

const mockEmailConfig: EmailConfig = {
  id: "email-cfg-1",
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUser: "postmaster@example.com",
  encryptionType: "TLS",
  senderName: "SIMS Notifications",
  senderEmail: "no-reply@example.com",
  isPasswordSet: true,
  updatedAt: "2026-07-28T10:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// useEmailConfig Hook
// =============================================================================

describe("useEmailConfig hook", () => {
  it("fetches email configuration successfully", async () => {
    vi.mocked(emailApi.getEmailConfig).mockResolvedValue(mockEmailConfig);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEmailConfig(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.smtpHost).toBe("smtp.example.com");
    expect(result.current.data?.smtpPort).toBe(587);
    expect(result.current.data?.encryptionType).toBe("TLS");
  });
});

// =============================================================================
// useUpdateEmailConfig Mutation
// =============================================================================

describe("useUpdateEmailConfig mutation", () => {
  it("updates email configuration via API", async () => {
    const updatedConfig = { ...mockEmailConfig, smtpPort: 465, encryptionType: "SSL" as const };
    vi.mocked(emailApi.updateEmailConfig).mockResolvedValue(updatedConfig);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateEmailConfig(), { wrapper });

    result.current.mutate({
      smtpHost: "smtp.example.com",
      smtpPort: 465,
      smtpUser: "postmaster@example.com",
      encryptionType: "SSL",
      senderName: "SIMS Notifications",
      senderEmail: "no-reply@example.com",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(emailApi.updateEmailConfig).toHaveBeenCalledWith(
      expect.objectContaining({ smtpPort: 465, encryptionType: "SSL" })
    );
  });
});

// =============================================================================
// useTestEmailConnection Mutation
// =============================================================================

describe("useTestEmailConnection mutation", () => {
  it("tests SMTP connection and returns success response", async () => {
    vi.mocked(emailApi.testConnection).mockResolvedValue({
      success: true,
      message: "Connection successful",
      responseTimeMs: 200,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useTestEmailConnection(), { wrapper });

    result.current.mutate({ recipientEmail: "admin@example.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.success).toBe(true);
    expect(emailApi.testConnection).toHaveBeenCalledWith({ recipientEmail: "admin@example.com" });
  });
});

// =============================================================================
// EmailConfigForm Component
// =============================================================================

describe("EmailConfigForm component", () => {
  it("renders email config form fields with existing values", () => {
    render(
      <EmailConfigForm
        config={mockEmailConfig}
        onSave={vi.fn()}
        onOpenTestModal={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByDisplayValue("smtp.example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("587")).toBeInTheDocument();
    expect(screen.getByDisplayValue("postmaster@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("SIMS Notifications")).toBeInTheDocument();
    expect(screen.getByDisplayValue("no-reply@example.com")).toBeInTheDocument();
  });

  it("renders Test Connection button", () => {
    render(
      <EmailConfigForm
        config={mockEmailConfig}
        onSave={vi.fn()}
        onOpenTestModal={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.getByText("Test Connection")).toBeInTheDocument();
  });

  it("opens test connection modal when Test Connection is clicked", () => {
    const mockOpenTestModal = vi.fn();
    render(
      <EmailConfigForm
        config={mockEmailConfig}
        onSave={vi.fn()}
        onOpenTestModal={mockOpenTestModal}
        isSubmitting={false}
      />
    );
    fireEvent.click(screen.getByText("Test Connection"));
    expect(mockOpenTestModal).toHaveBeenCalledOnce();
  });

  it("shows masked password placeholder when password is set", () => {
    render(
      <EmailConfigForm
        config={mockEmailConfig}
        onSave={vi.fn()}
        onOpenTestModal={vi.fn()}
        isSubmitting={false}
      />
    );
    // The actual placeholder rendered is bullet-dot chars ••••••••••••••••
    const passwordInput = screen.getByPlaceholderText("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
    expect(passwordInput).toBeInTheDocument();
  });
});

// =============================================================================
// TestConnectionModal Component
// =============================================================================

describe("TestConnectionModal component", () => {
  it("renders test connection form when isOpen is true", () => {
    render(
      <TestConnectionModal
        isOpen={true}
        onClose={vi.fn()}
        onTestConnection={vi.fn()}
        isTesting={false}
      />
    );
    expect(screen.getByText("Test SMTP Connection")).toBeInTheDocument();
    expect(screen.getByText("Send Test Email")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <TestConnectionModal
        isOpen={false}
        onClose={vi.fn()}
        onTestConnection={vi.fn()}
        isTesting={false}
      />
    );
    expect(screen.queryByText("Test SMTP Connection")).not.toBeInTheDocument();
  });

  it("shows validation error for invalid recipient email", async () => {
    render(
      <TestConnectionModal
        isOpen={true}
        onClose={vi.fn()}
        onTestConnection={vi.fn()}
        isTesting={false}
      />
    );

    // Submit the form element directly to bypass jsdom native constraint validation
    // so our custom guard (line 34 of component) can fire and render the error message.
    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Valid recipient email address is required/i)
      ).toBeInTheDocument();
    });
  });
});
