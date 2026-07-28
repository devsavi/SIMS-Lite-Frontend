import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSystemSettings, useUpdateSettingsSection } from "../settings/hooks/use-system-settings";
import { settingsApi } from "../settings/api/settings-api";
import { GeneralSettingsForm } from "../settings/components/GeneralSettingsForm";
import { InventorySettingsForm } from "../settings/components/InventorySettingsForm";
import { UnsavedChangesDialog } from "../settings/components/UnsavedChangesDialog";
import type { SystemSettingsConfig } from "../settings/types";

vi.mock("../settings/api/settings-api", () => ({
  settingsApi: {
    getSystemSettings: vi.fn(),
    updateSectionSettings: vi.fn(),
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

const mockConfig: SystemSettingsConfig = {
  general: {
    siteName: "SIMS Lite",
    supportEmail: "support@sims.io",
    sessionTimeoutMinutes: 60,
    timeZone: "UTC",
    dateFormat: "YYYY-MM-DD",
    maintenanceMode: false,
  },
  inventory: {
    lowStockThresholdDefault: 10,
    enableStockReservation: true,
    reservationExpiryHours: 48,
    allowNegativeStock: false,
    autoBatchTracking: true,
    barcodeFormat: "CODE128",
  },
  procurement: {
    autoApprovePoLimit: 500,
    requireGrnInspection: true,
    defaultPaymentTerms: "Net 30",
    allowOverReceivingPercentage: 5,
    enableSupplierRatings: true,
  },
  notifications: {
    emailAlertsEnabled: true,
    stockLevelAlerts: true,
    poApprovalAlerts: true,
    securityAlerts: true,
    digestFrequency: "REALTIME",
  },
  reports: {
    defaultExportFormat: "excel",
    pageSize: "A4",
    includeHeaderLogo: true,
    scheduledReportsEnabled: true,
  },
  updatedAt: "2026-07-28T10:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// useSystemSettings Hook
// =============================================================================

describe("useSystemSettings hook", () => {
  it("fetches system settings successfully", async () => {
    vi.mocked(settingsApi.getSystemSettings).mockResolvedValue(mockConfig);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSystemSettings(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.general.siteName).toBe("SIMS Lite");
    expect(result.current.data?.inventory.lowStockThresholdDefault).toBe(10);
    expect(result.current.data?.procurement.autoApprovePoLimit).toBe(500);
  });
});

// =============================================================================
// useUpdateSettingsSection Mutation
// =============================================================================

describe("useUpdateSettingsSection mutation", () => {
  it("updates general section settings", async () => {
    const updatedConfig = {
      ...mockConfig,
      general: { ...mockConfig.general, sessionTimeoutMinutes: 90 },
    };
    vi.mocked(settingsApi.updateSectionSettings).mockResolvedValue(updatedConfig);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateSettingsSection(), { wrapper });

    result.current.mutate({
      section: "general",
      data: { ...mockConfig.general, sessionTimeoutMinutes: 90 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.updateSectionSettings).toHaveBeenCalledWith(
      "general",
      expect.objectContaining({ sessionTimeoutMinutes: 90 })
    );
  });

  it("updates inventory section settings", async () => {
    const updatedConfig = {
      ...mockConfig,
      inventory: { ...mockConfig.inventory, allowNegativeStock: true },
    };
    vi.mocked(settingsApi.updateSectionSettings).mockResolvedValue(updatedConfig);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateSettingsSection(), { wrapper });

    result.current.mutate({
      section: "inventory",
      data: { ...mockConfig.inventory, allowNegativeStock: true },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

// =============================================================================
// GeneralSettingsForm Component
// =============================================================================

describe("GeneralSettingsForm component", () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockOnDirtyChange = vi.fn();

  it("renders all general settings fields with initial values", () => {
    render(
      <GeneralSettingsForm
        settings={mockConfig.general}
        onSave={mockOnSave}
        isSubmitting={false}
        onDirtyChange={mockOnDirtyChange}
      />
    );

    expect(screen.getByDisplayValue("SIMS Lite")).toBeInTheDocument();
    expect(screen.getByDisplayValue("support@sims.io")).toBeInTheDocument();
    expect(screen.getByDisplayValue("60")).toBeInTheDocument();
  });

  it("calls onDirtyChange when a field is modified", () => {
    render(
      <GeneralSettingsForm
        settings={mockConfig.general}
        onSave={mockOnSave}
        isSubmitting={false}
        onDirtyChange={mockOnDirtyChange}
      />
    );

    const siteNameInput = screen.getByDisplayValue("SIMS Lite");
    fireEvent.change(siteNameInput, { target: { value: "SIMS Lite Pro" } });
    expect(mockOnDirtyChange).toHaveBeenCalledWith(true);
  });
});

// =============================================================================
// InventorySettingsForm Component
// =============================================================================

describe("InventorySettingsForm component", () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockOnDirtyChange = vi.fn();

  it("renders inventory settings with correct initial values", () => {
    render(
      <InventorySettingsForm
        settings={mockConfig.inventory}
        onSave={mockOnSave}
        isSubmitting={false}
        onDirtyChange={mockOnDirtyChange}
      />
    );

    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("48")).toBeInTheDocument();
  });

  it("renders checkboxes with correct initial state", () => {
    render(
      <InventorySettingsForm
        settings={mockConfig.inventory}
        onSave={mockOnSave}
        isSubmitting={false}
        onDirtyChange={mockOnDirtyChange}
      />
    );

    const stockReservationCheckbox = screen.getByRole("checkbox", {
      name: /Enable Stock Reservations/i,
    });
    expect(stockReservationCheckbox).toBeChecked();
  });
});

// =============================================================================
// UnsavedChangesDialog Component
// =============================================================================

describe("UnsavedChangesDialog component", () => {
  it("renders unsaved changes dialog when isOpen is true", () => {
    render(
      <UnsavedChangesDialog
        isOpen={true}
        onConfirmLeave={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Unsaved Changes Detected")).toBeInTheDocument();
    expect(screen.getByText("Discard & Leave")).toBeInTheDocument();
    expect(screen.getByText("Stay & Keep Editing")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <UnsavedChangesDialog
        isOpen={false}
        onConfirmLeave={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByText("Unsaved Changes Detected")).not.toBeInTheDocument();
  });

  it("calls onConfirmLeave when Discard button is clicked", () => {
    const mockConfirmLeave = vi.fn();
    render(
      <UnsavedChangesDialog
        isOpen={true}
        onConfirmLeave={mockConfirmLeave}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("Discard & Leave"));
    expect(mockConfirmLeave).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Stay button is clicked", () => {
    const mockCancel = vi.fn();
    render(
      <UnsavedChangesDialog
        isOpen={true}
        onConfirmLeave={vi.fn()}
        onCancel={mockCancel}
      />
    );
    fireEvent.click(screen.getByText("Stay & Keep Editing"));
    expect(mockCancel).toHaveBeenCalledOnce();
  });
});
