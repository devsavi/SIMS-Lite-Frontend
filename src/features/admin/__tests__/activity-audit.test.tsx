import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActivityLogs, activityKeys } from "../activity/hooks/use-activity-log";
import { activityApi } from "../activity/api/activity-api";
import { useAuditTrail, auditKeys } from "../audit/hooks/use-audit-trail";
import { auditApi } from "../audit/api/audit-api";
import { ActivityLogTable } from "../activity/components/ActivityLogTable";
import { ActivityLogFilters } from "../activity/components/ActivityLogFilters";
import { ActivityDetailsModal } from "../activity/components/ActivityDetailsModal";
import { AuditTrailTable } from "../audit/components/AuditTrailTable";
import { AuditDiffModal } from "../audit/components/AuditDiffModal";
import type { ActivityLogEntry } from "../activity/types";
import type { AuditRecord } from "../audit/types";

vi.mock("../activity/api/activity-api", () => ({
  activityApi: {
    getActivityLogs: vi.fn(),
  },
}));

vi.mock("../audit/api/audit-api", () => ({
  auditApi: {
    getAuditRecords: vi.fn(),
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

const mockActivity: ActivityLogEntry = {
  id: "act-101",
  userId: "usr-1",
  userName: "Admin User",
  userEmail: "admin@test.com",
  userRole: "admin",
  action: "Updated System Settings",
  module: "SETTINGS",
  status: "SUCCESS",
  timestamp: "2026-07-28T14:12:00Z",
  ipAddress: "192.168.1.1",
  details: { section: "general" },
};

const mockAuditRecord: AuditRecord = {
  id: "audit-1001",
  entity: "User",
  entityId: "usr-4",
  action: "UPDATE",
  userId: "usr-2",
  userName: "Jane Doe",
  userEmail: "jane@test.com",
  timestamp: "2026-07-28T15:20:00Z",
  ipAddress: "192.168.1.50",
  changedFields: ["role"],
  diffs: [
    { field: "role", previousValue: "stock_clerk", newValue: "warehouse_manager" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Activity Log Keys
// =============================================================================

describe("activityKeys query key factory", () => {
  it("generates correct base key", () => {
    expect(activityKeys.all).toEqual(["activity-logs"]);
  });

  it("generates list key with filters", () => {
    const filters = { search: "login" };
    expect(activityKeys.list(filters)).toEqual(["activity-logs", "list", filters]);
  });
});

// =============================================================================
// useActivityLogs Hook
// =============================================================================

describe("useActivityLogs hook", () => {
  it("fetches activity logs successfully", async () => {
    vi.mocked(activityApi.getActivityLogs).mockResolvedValue({
      data: [mockActivity],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivityLogs(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].action).toBe("Updated System Settings");
  });

  it("applies module filter to query", async () => {
    vi.mocked(activityApi.getActivityLogs).mockResolvedValue({
      data: [mockActivity],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useActivityLogs({ module: "SETTINGS", page: 1, limit: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(activityApi.getActivityLogs).toHaveBeenCalledWith(
      expect.objectContaining({ module: "SETTINGS" })
    );
  });
});

// =============================================================================
// ActivityLogTable Component
// =============================================================================

describe("ActivityLogTable component", () => {
  it("renders activity log entries in table", () => {
    render(
      <ActivityLogTable
        logs={[mockActivity]}
        isLoading={false}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Updated System Settings")).toBeInTheDocument();
    expect(screen.getByText("SETTINGS")).toBeInTheDocument();
    expect(screen.getByText("SUCCESS")).toBeInTheDocument();
  });

  it("renders empty state when no logs found", () => {
    render(
      <ActivityLogTable logs={[]} isLoading={false} onViewDetails={vi.fn()} />
    );
    expect(
      screen.getByText("No activity logs match the selected filter criteria.")
    ).toBeInTheDocument();
  });

  it("calls onViewDetails when Eye button is clicked", () => {
    const mockViewDetails = vi.fn();
    render(
      <ActivityLogTable
        logs={[mockActivity]}
        isLoading={false}
        onViewDetails={mockViewDetails}
      />
    );

    const eyeBtn = screen.getByRole("button", { name: /View details for action/i });
    fireEvent.click(eyeBtn);
    expect(mockViewDetails).toHaveBeenCalledWith(mockActivity);
  });
});

// =============================================================================
// ActivityLogFilters Component
// =============================================================================

describe("ActivityLogFilters component", () => {
  it("renders search input and filter dropdowns", () => {
    render(
      <ActivityLogFilters
        filters={{ search: "", module: "ALL", status: "ALL" }}
        onFilterChange={vi.fn()}
      />
    );
    expect(
      screen.getByPlaceholderText("Search logs by action, user name or email...")
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Filter by module/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Filter by status/i })).toBeInTheDocument();
  });
});

// =============================================================================
// ActivityDetailsModal Component
// =============================================================================

describe("ActivityDetailsModal component", () => {
  it("renders activity details when entry is provided", () => {
    render(
      <ActivityDetailsModal
        entry={mockActivity}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/Activity Log Details — act-101/)).toBeInTheDocument();
    expect(screen.getByText("Admin User (admin@test.com)")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <ActivityDetailsModal entry={mockActivity} isOpen={false} onClose={vi.fn()} />
    );
    expect(screen.queryByText("Activity Log Details")).not.toBeInTheDocument();
  });
});

// =============================================================================
// Audit Trail Keys
// =============================================================================

describe("auditKeys query key factory", () => {
  it("generates correct base key", () => {
    expect(auditKeys.all).toEqual(["audit-trail"]);
  });

  it("generates list key with filters", () => {
    const filters = { entity: "User" };
    expect(auditKeys.list(filters)).toEqual(["audit-trail", "list", filters]);
  });
});

// =============================================================================
// useAuditTrail Hook
// =============================================================================

describe("useAuditTrail hook", () => {
  it("fetches audit records successfully", async () => {
    vi.mocked(auditApi.getAuditRecords).mockResolvedValue({
      data: [mockAuditRecord],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuditTrail(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].entity).toBe("User");
    expect(result.current.data?.data[0].action).toBe("UPDATE");
  });
});

// =============================================================================
// AuditTrailTable Component
// =============================================================================

describe("AuditTrailTable component", () => {
  it("renders audit records in table rows", () => {
    render(
      <AuditTrailTable
        records={[mockAuditRecord]}
        isLoading={false}
        onViewDiff={vi.fn()}
      />
    );
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("role")).toBeInTheDocument();
  });

  it("calls onViewDiff when Inspect Diff button is clicked", () => {
    const mockViewDiff = vi.fn();
    render(
      <AuditTrailTable
        records={[mockAuditRecord]}
        isLoading={false}
        onViewDiff={mockViewDiff}
      />
    );
    const inspectBtn = screen.getByText("Inspect Diff");
    fireEvent.click(inspectBtn);
    expect(mockViewDiff).toHaveBeenCalledWith(mockAuditRecord);
  });
});

// =============================================================================
// AuditDiffModal Component
// =============================================================================

describe("AuditDiffModal component", () => {
  it("renders diff modal with previous and new values", () => {
    render(
      <AuditDiffModal
        record={mockAuditRecord}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/Audit History Diff — User/)).toBeInTheDocument();
    expect(screen.getByText("Previous Value")).toBeInTheDocument();
    expect(screen.getByText("New Value")).toBeInTheDocument();
    expect(screen.getByText("stock_clerk")).toBeInTheDocument();
    expect(screen.getByText("warehouse_manager")).toBeInTheDocument();
  });

  it("shows the number of changed fields", () => {
    render(
      <AuditDiffModal
        record={mockAuditRecord}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Field Mutations (1 changed)")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <AuditDiffModal record={mockAuditRecord} isOpen={false} onClose={vi.fn()} />
    );
    expect(screen.queryByText("Audit History Diff")).not.toBeInTheDocument();
  });
});
