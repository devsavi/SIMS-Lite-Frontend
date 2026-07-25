/**
 * QuickActions — unit tests
 * Verifies role-specific action sets and permission guarding.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AdminQuickActions,
  OfficerQuickActions,
  StoreKeeperQuickActions,
} from "../components/widgets/QuickActions";
import { useAuthStore } from "@/stores/auth.store";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

function setupRole(role: string) {
  mockUseAuthStore.mockReturnValue({
    role,
    isAuthenticated: true,
  } as ReturnType<typeof useAuthStore>);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AdminQuickActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all admin actions for admin role", () => {
    setupRole("admin");
    render(<AdminQuickActions />);
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Create Supplier")).toBeInTheDocument();
    expect(screen.getByText("Create Purchase Order")).toBeInTheDocument();
    expect(screen.getByText("View Inventory")).toBeInTheDocument();
    expect(screen.getByText("View Reports")).toBeInTheDocument();
  });

  it("hides actions for roles without permission", () => {
    setupRole("stock_clerk");
    render(<AdminQuickActions />);
    // stock_clerk has no products.create permission
    expect(screen.queryByText("Create Product")).not.toBeInTheDocument();
    // but has inventory.view
    expect(screen.getByText("View Inventory")).toBeInTheDocument();
  });
});

describe("OfficerQuickActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders officer actions", () => {
    setupRole("procurement_officer");
    render(<OfficerQuickActions />);
    expect(screen.getByText("Create Purchase Order")).toBeInTheDocument();
    expect(screen.getByText("Receive Goods")).toBeInTheDocument();
    expect(screen.getByText("View Inventory")).toBeInTheDocument();
  });
});

describe("StoreKeeperQuickActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders store keeper actions", () => {
    setupRole("stock_clerk");
    render(<StoreKeeperQuickActions />);
    expect(screen.getByText("Stock Adjustment")).toBeInTheDocument();
    expect(screen.getByText("Stock Release")).toBeInTheDocument();
    expect(screen.getByText("View Inventory")).toBeInTheDocument();
  });
});
