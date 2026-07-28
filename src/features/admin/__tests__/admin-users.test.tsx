import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useUsersList,
  useCreateUser,
  useUpdateUser,
  useToggleUserStatus,
  useResetUserPassword,
  useAssignUserRole,
  adminUsersKeys,
} from "../users/hooks/use-admin-users";
import { adminUsersApi } from "../users/api/admin-users-api";
import { UserList } from "../users/components/UserList";
import { UserFormDialog } from "../users/components/UserFormDialog";
import { UserRoleModal } from "../users/components/UserRoleModal";
import { ResetPasswordModal } from "../users/components/ResetPasswordModal";
import { UserStatusToggle } from "../users/components/UserStatusToggle";
import type { UserItem } from "../users/types";

vi.mock("../users/api/admin-users-api", () => ({
  adminUsersApi: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    toggleUserStatus: vi.fn(),
    resetPassword: vi.fn(),
    assignRole: vi.fn(),
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

const mockUser: UserItem = {
  id: "usr-1",
  name: "Jane Doe",
  email: "jane@test.com",
  role: "admin",
  status: "ACTIVE",
  lastLogin: "2026-07-28T10:00:00Z",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-07-28T10:00:00Z",
  department: "IT",
  phone: "+1 555-0001",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Query Key Tests
// =============================================================================

describe("adminUsersKeys query key factory", () => {
  it("generates correct base key", () => {
    expect(adminUsersKeys.all).toEqual(["admin-users"]);
  });

  it("generates correct list key with filters", () => {
    const filters = { search: "jane", role: "admin" as const };
    expect(adminUsersKeys.list(filters)).toEqual(["admin-users", "list", filters]);
  });

  it("generates correct detail key for user id", () => {
    expect(adminUsersKeys.detail("usr-99")).toEqual(["admin-users", "detail", "usr-99"]);
  });
});

// =============================================================================
// useUsersList Hook
// =============================================================================

describe("useUsersList hook", () => {
  it("fetches users list successfully", async () => {
    vi.mocked(adminUsersApi.getUsers).mockResolvedValue({
      data: [mockUser],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUsersList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].name).toBe("Jane Doe");
  });

  it("filters users by search query", async () => {
    vi.mocked(adminUsersApi.getUsers).mockResolvedValue({
      data: [mockUser],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUsersList({ search: "Jane" }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminUsersApi.getUsers).toHaveBeenCalledWith({ search: "Jane" });
  });
});

// =============================================================================
// useCreateUser Mutation
// =============================================================================

describe("useCreateUser mutation", () => {
  it("creates a new user via API", async () => {
    vi.mocked(adminUsersApi.createUser).mockResolvedValue(mockUser);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate({
      name: "Jane Doe",
      email: "jane@test.com",
      role: "admin",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminUsersApi.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Jane Doe", email: "jane@test.com" })
    );
  });
});

// =============================================================================
// useToggleUserStatus Mutation
// =============================================================================

describe("useToggleUserStatus mutation", () => {
  it("activates a user account", async () => {
    vi.mocked(adminUsersApi.toggleUserStatus).mockResolvedValue({
      ...mockUser,
      status: "ACTIVE",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleUserStatus(), { wrapper });

    result.current.mutate({ id: "usr-1", status: "ACTIVE" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminUsersApi.toggleUserStatus).toHaveBeenCalledWith("usr-1", "ACTIVE");
  });

  it("deactivates a user account", async () => {
    vi.mocked(adminUsersApi.toggleUserStatus).mockResolvedValue({
      ...mockUser,
      status: "INACTIVE",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleUserStatus(), { wrapper });

    result.current.mutate({ id: "usr-1", status: "INACTIVE" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminUsersApi.toggleUserStatus).toHaveBeenCalledWith("usr-1", "INACTIVE");
  });
});

// =============================================================================
// useAssignUserRole Mutation
// =============================================================================

describe("useAssignUserRole mutation", () => {
  it("assigns a new role to user", async () => {
    vi.mocked(adminUsersApi.assignRole).mockResolvedValue({
      ...mockUser,
      role: "warehouse_manager",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAssignUserRole(), { wrapper });

    result.current.mutate({
      userId: "usr-1",
      role: "warehouse_manager",
      reason: "Promotion",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminUsersApi.assignRole).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "usr-1", role: "warehouse_manager" })
    );
  });
});

// =============================================================================
// useResetUserPassword Mutation
// =============================================================================

describe("useResetUserPassword mutation", () => {
  it("sends password reset request", async () => {
    vi.mocked(adminUsersApi.resetPassword).mockResolvedValue({
      message: "Reset email sent",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResetUserPassword(), { wrapper });

    result.current.mutate({ userId: "usr-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminUsersApi.resetPassword).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "usr-1" })
    );
  });
});

// =============================================================================
// UserList Component
// =============================================================================

describe("UserList component", () => {
  const defaultProps = {
    users: [mockUser],
    isLoading: false,
    total: 1,
    page: 1,
    totalPages: 1,
    filters: { search: "", page: 1, limit: 10 },
    onFilterChange: vi.fn(),
    onViewDetails: vi.fn(),
    onEditUser: vi.fn(),
    onAssignRole: vi.fn(),
    onResetPassword: vi.fn(),
    onToggleStatus: vi.fn(),
  };

  it("renders user data in table rows", () => {
    render(<UserList {...defaultProps} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@test.com")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("shows loading skeleton rows when isLoading is true", () => {
    render(<UserList {...defaultProps} users={[]} isLoading={true} total={0} />);
    // Skeleton rows are rendered as tr elements with animate-pulse class
    const rows = document.querySelectorAll("tr.animate-pulse");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("renders empty state when no users found", () => {
    render(<UserList {...defaultProps} users={[]} total={0} />);
    expect(
      screen.getByText("No users found matching the selected criteria.")
    ).toBeInTheDocument();
  });

  it("calls onFilterChange when search query changes", () => {
    render(<UserList {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(
      "Search users by name, email or department..."
    );
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "test", page: 1 })
    );
  });

  it("calls onViewDetails when Eye button is clicked", () => {
    render(<UserList {...defaultProps} />);
    const viewBtn = screen.getByTitle("View Details");
    fireEvent.click(viewBtn);
    expect(defaultProps.onViewDetails).toHaveBeenCalledWith(mockUser);
  });

  it("calls onEditUser when Edit button is clicked", () => {
    render(<UserList {...defaultProps} />);
    const editBtn = screen.getByTitle("Edit User");
    fireEvent.click(editBtn);
    expect(defaultProps.onEditUser).toHaveBeenCalledWith(mockUser);
  });
});

// =============================================================================
// UserFormDialog Component
// =============================================================================

describe("UserFormDialog component", () => {
  const mockOnSubmitCreate = vi.fn().mockResolvedValue(undefined);
  const mockOnSubmitUpdate = vi.fn().mockResolvedValue(undefined);

  it("renders create user form when no user is provided", () => {
    render(
      <UserFormDialog
        isOpen={true}
        onClose={vi.fn()}
        user={null}
        onSubmitCreate={mockOnSubmitCreate}
        onSubmitUpdate={mockOnSubmitUpdate}
        isSubmitting={false}
      />
    );
    expect(screen.getByText("Create New User")).toBeInTheDocument();
    expect(screen.getByText("Create User")).toBeInTheDocument();
  });

  it("renders edit user form when user is provided", () => {
    render(
      <UserFormDialog
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        onSubmitCreate={mockOnSubmitCreate}
        onSubmitUpdate={mockOnSubmitUpdate}
        isSubmitting={false}
      />
    );
    expect(screen.getByText("Edit User Account")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    render(
      <UserFormDialog
        isOpen={true}
        onClose={vi.fn()}
        user={null}
        onSubmitCreate={mockOnSubmitCreate}
        onSubmitUpdate={mockOnSubmitUpdate}
        isSubmitting={false}
      />
    );

    const submitBtn = screen.getByText("Create User");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });
});

// =============================================================================
// UserStatusToggle Component
// =============================================================================

describe("UserStatusToggle component", () => {
  it("renders deactivation confirmation for active users", () => {
    render(
      <UserStatusToggle
        user={mockUser}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.getByText("Deactivate User Account?")).toBeInTheDocument();
    expect(screen.getByText("Confirm Deactivate")).toBeInTheDocument();
  });

  it("renders activation confirmation for inactive users", () => {
    render(
      <UserStatusToggle
        user={{ ...mockUser, status: "INACTIVE" }}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.getByText("Activate User Account?")).toBeInTheDocument();
    expect(screen.getByText("Confirm Activate")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const mockConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <UserStatusToggle
        user={mockUser}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={mockConfirm}
        isSubmitting={false}
      />
    );

    fireEvent.click(screen.getByText("Confirm Deactivate"));
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith("usr-1", "INACTIVE");
    });
  });
});

// =============================================================================
// UserRoleModal Component
// =============================================================================

describe("UserRoleModal component", () => {
  it("renders role assignment dialog with user name", () => {
    render(
      <UserRoleModal
        user={mockUser}
        isOpen={true}
        onClose={vi.fn()}
        onAssignRole={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.getByText(`Assign Role — ${mockUser.name}`)).toBeInTheDocument();
    expect(screen.getByText("Update Role")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <UserRoleModal
        user={mockUser}
        isOpen={false}
        onClose={vi.fn()}
        onAssignRole={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.queryByText("Update Role")).not.toBeInTheDocument();
  });
});
