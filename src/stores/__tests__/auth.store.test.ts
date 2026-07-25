/**
 * Auth store — unit tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../auth.store";

vi.mock("@/lib/auth/token", () => ({
  accessToken: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
    isExpired: vi.fn(() => true),
  },
  refreshToken: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
  },
  persistedUser: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
  },
  clearAllTokens: vi.fn(),
  isSessionValid: vi.fn(() => false),
}));

vi.mock("@/lib/api/client", () => ({
  configureTokenHandlers: vi.fn(),
}));

vi.mock("@/lib/query/query-client", () => ({
  getQueryClient: () => ({ clear: vi.fn() }),
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  authApi: {
    logout: vi.fn(() => Promise.resolve({ message: "ok" })),
    refreshToken: vi.fn(),
  },
}));

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "admin" as const,
};

const mockTokens = {
  accessToken: "access-token-123",
  refreshToken: "refresh-token-abc",
  expiresIn: 3600,
};

describe("Auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login()", () => {
    it("sets user and isAuthenticated to true", () => {
      useAuthStore.getState().login(mockUser, mockTokens);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.role).toBe("admin");
    });

    it("populates permissions for the role", () => {
      useAuthStore.getState().login(mockUser, mockTokens);
      const { permissions } = useAuthStore.getState();
      expect(permissions).toContain("dashboard.view");
      expect(permissions).toContain("users.create");
      expect(permissions).toContain("products.delete");
    });
  });

  describe("setUser()", () => {
    it("updates user without clearing auth", () => {
      useAuthStore.getState().login(mockUser, mockTokens);
      useAuthStore.getState().setUser({ ...mockUser, name: "Updated Name" });
      expect(useAuthStore.getState().user?.name).toBe("Updated Name");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe("clearSession()", () => {
    it("resets all auth state", () => {
      useAuthStore.getState().login(mockUser, mockTokens);
      useAuthStore.getState().clearSession();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBeNull();
      expect(state.permissions).toHaveLength(0);
    });
  });

  describe("can()", () => {
    it("returns true for a permission the role has", () => {
      useAuthStore.getState().login(mockUser, mockTokens);
      expect(useAuthStore.getState().can("products.create")).toBe(true);
    });

    it("returns false when not authenticated", () => {
      expect(useAuthStore.getState().can("products.create")).toBe(false);
    });

    it("returns false for a permission the role lacks", () => {
      const storeKeeperUser = { ...mockUser, role: "stock_clerk" as const };
      useAuthStore.getState().login(storeKeeperUser, mockTokens);
      expect(useAuthStore.getState().can("users.create")).toBe(false);
    });
  });

  describe("logout()", () => {
    it("clears session after logout", async () => {
      useAuthStore.getState().login(mockUser, mockTokens);
      const replaceSpy = vi.fn();
      Object.defineProperty(window, "location", {
        value: { replace: replaceSpy },
        writable: true,
      });
      await useAuthStore.getState().logout();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
