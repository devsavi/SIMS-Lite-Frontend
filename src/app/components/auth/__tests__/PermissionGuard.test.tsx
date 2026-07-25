/**
 * PermissionGuard — tests
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PermissionGuard } from "../PermissionGuard";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

describe("PermissionGuard", () => {
  beforeEach(() => vi.clearAllMocks());

  function setupStore(role: string, isAuthenticated = true) {
    mockUseAuthStore.mockReturnValue({
      role,
      isAuthenticated,
    } as ReturnType<typeof useAuthStore>);
  }

  it("renders children when admin has the permission", () => {
    setupStore("admin");
    render(
      <PermissionGuard permission="products.create">
        <span>Create button</span>
      </PermissionGuard>
    );
    expect(screen.getByText("Create button")).toBeInTheDocument();
  });

  it("does not render children when stock_clerk lacks the permission", () => {
    setupStore("stock_clerk");
    render(
      <PermissionGuard permission="users.create">
        <span>Create user button</span>
      </PermissionGuard>
    );
    expect(screen.queryByText("Create user button")).not.toBeInTheDocument();
  });

  it("renders fallback when permission is denied", () => {
    setupStore("stock_clerk");
    render(
      <PermissionGuard permission="settings.edit" fallback={<span>Access denied</span>}>
        <span>Settings panel</span>
      </PermissionGuard>
    );
    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(screen.queryByText("Settings panel")).not.toBeInTheDocument();
  });

  it("renders nothing when not authenticated", () => {
    setupStore("admin", false);
    render(
      <PermissionGuard permission="products.view">
        <span>Products</span>
      </PermissionGuard>
    );
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
  });

  it("allOf — renders when role has all permissions", () => {
    setupStore("admin");
    render(
      <PermissionGuard allOf={["users.view", "users.create"]}>
        <span>User management</span>
      </PermissionGuard>
    );
    expect(screen.getByText("User management")).toBeInTheDocument();
  });

  it("allOf — hides when role lacks one permission", () => {
    setupStore("stock_clerk");
    render(
      <PermissionGuard allOf={["inventory.view", "users.create"]}>
        <span>Mixed panel</span>
      </PermissionGuard>
    );
    expect(screen.queryByText("Mixed panel")).not.toBeInTheDocument();
  });

  it("anyOf — renders when role has at least one permission", () => {
    setupStore("stock_clerk");
    render(
      <PermissionGuard anyOf={["users.create", "inventory.view"]}>
        <span>Inventory or users</span>
      </PermissionGuard>
    );
    expect(screen.getByText("Inventory or users")).toBeInTheDocument();
  });
});
