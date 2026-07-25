/**
 * DashboardRouter — unit tests
 * Verifies that the correct dashboard variant is rendered per role.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardRouter } from "../pages/DashboardRouter";
import { useAuthStore } from "@/stores/auth.store";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

// Mock the three dashboard pages so we don't pull in the full API layer
vi.mock("../pages/AdminDashboard", () => ({
  AdminDashboard: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));
vi.mock("../pages/OfficerDashboard", () => ({
  OfficerDashboard: () => <div data-testid="officer-dashboard">Officer Dashboard</div>,
}));
vi.mock("../pages/StoreKeeperDashboard", () => ({
  StoreKeeperDashboard: () => <div data-testid="storekeeper-dashboard">StoreKeeper Dashboard</div>,
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

// useAuthStore is called with a selector: useAuthStore((s) => s.role)
// The mock must invoke that selector with a fake store state.
function setupRole(role: string | null) {
  mockUseAuthStore.mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selector: any) => selector({ role })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DashboardRouter", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders AdminDashboard for admin role", () => {
    setupRole("admin");
    render(<DashboardRouter />);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("renders AdminDashboard for super_admin role", () => {
    setupRole("super_admin");
    render(<DashboardRouter />);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("renders OfficerDashboard for procurement_officer role", () => {
    setupRole("procurement_officer");
    render(<DashboardRouter />);
    expect(screen.getByTestId("officer-dashboard")).toBeInTheDocument();
  });

  it("renders OfficerDashboard for warehouse_manager role", () => {
    setupRole("warehouse_manager");
    render(<DashboardRouter />);
    expect(screen.getByTestId("officer-dashboard")).toBeInTheDocument();
  });

  it("renders StoreKeeperDashboard for stock_clerk role", () => {
    setupRole("stock_clerk");
    render(<DashboardRouter />);
    expect(screen.getByTestId("storekeeper-dashboard")).toBeInTheDocument();
  });

  it("falls back to AdminDashboard for viewer role", () => {
    setupRole("viewer");
    render(<DashboardRouter />);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("falls back to AdminDashboard for null role", () => {
    setupRole(null);
    render(<DashboardRouter />);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });
});
