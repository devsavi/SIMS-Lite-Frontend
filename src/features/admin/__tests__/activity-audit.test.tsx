import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdminAuditLogs, auditLogKeys } from "../activity/hooks/use-activity-log";
import { auditLogsApi } from "../activity/api/activity-api";
import { AuditLogTable } from "../activity/components/ActivityLogTable";
import { AuditLogFilters } from "../activity/components/ActivityLogFilters";
import { AuditLogDetailsModal } from "../activity/components/ActivityDetailsModal";
import type { AuditLogEntry, AuditLogFilterParams } from "../activity/types";

vi.mock("../activity/api/activity-api", () => ({
  auditLogsApi: {
    getAuditLogs: vi.fn(),
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

const DEFAULT_FILTERS: AuditLogFilterParams = {
  period: "today",
  action: "all",
  resource_type: "all",
  page: 1,
  size: 20,
};

const mockEntry: AuditLogEntry = {
  id: "86c51c81-0aad-4b39-9b5d-c17f61d9f0c2",
  actor_id: "58b10eb1-59e4-4612-b4f4-980fbd38f890",
  actor: {
    id: "58b10eb1-59e4-4612-b4f4-980fbd38f890",
    email: "storekeeper@yopmail.com",
    full_name: "Store Keeper",
  },
  action: "auth.token_refresh",
  resource_type: "User",
  resource_id: "58b10eb1-59e4-4612-b4f4-980fbd38f890",
  ip_address: "127.0.0.1",
  status: "success",
  detail: null,
  created_at: "2026-07-30T17:33:04.842887Z",
};

const mockApiResponse = {
  status: "success",
  data: [mockEntry],
  pagination: { page: 1, size: 20, total: 1, pages: 1 },
};

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Query Key Factory
// =============================================================================

describe("auditLogKeys query key factory", () => {
  it("generates correct base key", () => {
    expect(auditLogKeys.all).toEqual(["admin-audit-logs"]);
  });

  it("generates list key with filters", () => {
    expect(auditLogKeys.list(DEFAULT_FILTERS)).toEqual([
      "admin-audit-logs",
      "list",
      DEFAULT_FILTERS,
    ]);
  });
});

// =============================================================================
// useAdminAuditLogs Hook
// =============================================================================

describe("useAdminAuditLogs hook", () => {
  it("fetches audit logs successfully", async () => {
    vi.mocked(auditLogsApi.getAuditLogs).mockResolvedValue(mockApiResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAdminAuditLogs(DEFAULT_FILTERS), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].action).toBe("auth.token_refresh");
  });

  it("passes filters correctly to the API", async () => {
    vi.mocked(auditLogsApi.getAuditLogs).mockResolvedValue(mockApiResponse);
    const filters: AuditLogFilterParams = { ...DEFAULT_FILTERS, action: "auth", resource_type: "User" };

    const wrapper = createWrapper();
    renderHook(() => useAdminAuditLogs(filters), { wrapper });

    await waitFor(() => expect(auditLogsApi.getAuditLogs).toHaveBeenCalledWith(filters));
  });
});

// =============================================================================
// AuditLogTable Component
// =============================================================================

describe("AuditLogTable component", () => {
  it("renders audit log entries in table rows", () => {
    render(
      <AuditLogTable logs={[mockEntry]} isLoading={false} onViewDetails={vi.fn()} />
    );
    expect(screen.getByText("Store Keeper")).toBeInTheDocument();
    expect(screen.getByText("storekeeper@yopmail.com")).toBeInTheDocument();
    expect(screen.getByText("127.0.0.1")).toBeInTheDocument();
    // Status badge
    expect(screen.getByText("success")).toBeInTheDocument();
  });

  it("renders empty state when no logs found", () => {
    render(
      <AuditLogTable logs={[]} isLoading={false} onViewDetails={vi.fn()} />
    );
    expect(
      screen.getByText("No activity logs match the selected filter criteria.")
    ).toBeInTheDocument();
  });

  it("calls onViewDetails when Eye button is clicked", () => {
    const mockViewDetails = vi.fn();
    render(
      <AuditLogTable logs={[mockEntry]} isLoading={false} onViewDetails={mockViewDetails} />
    );

    const eyeBtn = screen.getByRole("button", { name: /View details for auth.token_refresh/i });
    fireEvent.click(eyeBtn);
    expect(mockViewDetails).toHaveBeenCalledWith(mockEntry);
  });
});

// =============================================================================
// AuditLogFilters Component
// =============================================================================

describe("AuditLogFilters component", () => {
  it("renders period buttons", () => {
    render(
      <AuditLogFilters filters={DEFAULT_FILTERS} onFilterChange={vi.fn()} />
    );
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("This Week")).toBeInTheDocument();
    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.getByText("Custom Range")).toBeInTheDocument();
  });

  it("shows date inputs when custom period is selected", () => {
    const filters: AuditLogFilterParams = { ...DEFAULT_FILTERS, period: "custom" };
    render(
      <AuditLogFilters filters={filters} onFilterChange={vi.fn()} />
    );
    expect(screen.getByLabelText("Date from")).toBeInTheDocument();
    expect(screen.getByLabelText("Date to")).toBeInTheDocument();
  });

  it("calls onFilterChange when a period button is clicked", () => {
    const onChange = vi.fn();
    render(
      <AuditLogFilters filters={DEFAULT_FILTERS} onFilterChange={onChange} />
    );
    fireEvent.click(screen.getByText("This Week"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ period: "week" }));
  });
});

// =============================================================================
// AuditLogDetailsModal Component
// =============================================================================

describe("AuditLogDetailsModal component", () => {
  it("renders entry details when open", () => {
    render(
      <AuditLogDetailsModal entry={mockEntry} isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByText("Activity Log Details")).toBeInTheDocument();
    expect(screen.getByText(/Store Keeper/)).toBeInTheDocument();
    expect(screen.getByText(/storekeeper@yopmail\.com/)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <AuditLogDetailsModal entry={mockEntry} isOpen={false} onClose={vi.fn()} />
    );
    expect(screen.queryByText("Activity Log Details")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <AuditLogDetailsModal entry={mockEntry} isOpen={true} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Close dialog/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
