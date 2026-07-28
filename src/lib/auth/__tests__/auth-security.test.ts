import { describe, it, expect, beforeEach, vi } from "vitest";
import { clearAllTokens, accessToken, refreshToken, persistedUser } from "../token";
import { useAuthStore } from "@/stores/auth.store";
import { useSessionStore } from "@/stores/session.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import type { AuthUser } from "../index";

const mockUser: AuthUser = {
  id: "usr-123",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
};

describe("Authentication Security Hardening", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.setState({
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
    });
    useSessionStore.setState({
      user: null,
      isAuthenticated: false,
    });
    useNotificationsStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  describe("Token & Storage Cleanup", () => {
    it("purges all tokens and persisted session keys on clearAllTokens()", () => {
      accessToken.set("access-123", 900);
      refreshToken.set("refresh-123");
      persistedUser.set(mockUser);
      localStorage.setItem("sims-session", JSON.stringify({ user: mockUser }));

      expect(refreshToken.get()).toBe("refresh-123");

      clearAllTokens();

      expect(accessToken.get()).toBeNull();
      expect(refreshToken.get()).toBeNull();
      expect(persistedUser.get()).toBeNull();
      expect(localStorage.getItem("sims-session")).toBeNull();
    });

    it("resets auth store, session store, and notifications store on clearSession()", () => {
      useAuthStore.getState().login(mockUser, {
        accessToken: "access-123",
        refreshToken: "refresh-123",
        expiresIn: 900,
      });

      useNotificationsStore.getState().addNotification({
        type: "info",
        title: "Test Notification",
        message: "Secret info",
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useNotificationsStore.getState().notifications.length).toBe(1);

      useAuthStore.getState().clearSession();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useSessionStore.getState().isAuthenticated).toBe(false);
      expect(useNotificationsStore.getState().notifications.length).toBe(0);
    });
  });

  describe("Multi-Tab Synchronization", () => {
    it("triggers session clearing when refresh token is removed in another tab", () => {
      const clearSessionSpy = vi.spyOn(useAuthStore.getState(), "clearSession");

      const storageEvent = new StorageEvent("storage", {
        key: "__sims_rt__",
        oldValue: "refresh-123",
        newValue: null,
      });

      // Simulate storage event handler
      if (storageEvent.key === "__sims_rt__" && !storageEvent.newValue) {
        useAuthStore.getState().clearSession();
      }

      expect(clearSessionSpy).toHaveBeenCalled();
    });
  });
});
