/**
 * Auth Zustand store — central authentication state.
 */

"use client";

import { create } from "zustand";
import { getQueryClient } from "@/lib/query/query-client";
import { configureTokenHandlers } from "@/lib/api/client";
import {
  accessToken,
  refreshToken,
  persistedUser,
  clearAllTokens,
} from "@/lib/auth/token";
import { canAccess, getPermissions, type Permission } from "@/lib/auth/permissions";
import type { UserRole, AuthUser } from "@/lib/auth";
import { authApi } from "@/features/auth/api/auth-api";

import { useSessionStore } from "./session.store";
import { useNotificationsStore } from "./notifications.store";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  // Actions
  login: (user: AuthUser, tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  can: (permission: Permission) => boolean;
}

// ---------------------------------------------------------------------------
// Store — isLoading is intentionally NOT in the store.
// SessionProvider owns the loading/hydration gate via its own local state,
// which avoids timing issues where the store resets to isLoading:true on
// every new page render before the effect fires.
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  role: null,
  permissions: [],
  isAuthenticated: false,

  // -----------------------------------------------------------------------
  // login — called after successful API response
  // -----------------------------------------------------------------------
  login: (user, tokens) => {
    accessToken.set(tokens.accessToken, tokens.expiresIn);
    refreshToken.set(tokens.refreshToken);
    persistedUser.set(user);

    const role = user.role as UserRole;
    const permissions = getPermissions(role);

    useSessionStore.getState().setUser(user);

    set({
      user,
      role,
      permissions,
      isAuthenticated: true,
    });
  },

  // -----------------------------------------------------------------------
  // logout — clean up everything and hard-redirect
  // -----------------------------------------------------------------------
  logout: async () => {
    const rt = refreshToken.get();

    if (rt) {
      try {
        await authApi.logout(rt);
      } catch {
        // ignore — clear local state regardless
      }
    }

    clearAllTokens();
    getQueryClient().clear();
    useSessionStore.getState().clearSession();
    useNotificationsStore.getState().clearAll();

    set({
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
    });

    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  },

  // -----------------------------------------------------------------------
  // setUser — update user profile without touching tokens
  // -----------------------------------------------------------------------
  setUser: (user) => {
    const role = user.role as UserRole;
    useSessionStore.getState().setUser(user);
    set({
      user,
      role,
      permissions: getPermissions(role),
    });
  },

  // -----------------------------------------------------------------------
  // clearSession — synchronous reset (used by auth failure handler)
  // -----------------------------------------------------------------------
  clearSession: () => {
    clearAllTokens();
    getQueryClient().clear();
    useSessionStore.getState().clearSession();
    useNotificationsStore.getState().clearAll();
    set({
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
    });
  },

  // -----------------------------------------------------------------------
  // can — permission check shorthand
  // -----------------------------------------------------------------------
  can: (permission) => {
    const { role } = get();
    if (!role) return false;
    return canAccess(role, permission);
  },
}));

// ---------------------------------------------------------------------------
// Wire up the API client once (called from SessionProvider)
// ---------------------------------------------------------------------------

let _initialized = false;

export function initAuthClient() {
  if (_initialized) return;
  _initialized = true;

  configureTokenHandlers({
    getAccessToken: () => accessToken.get(),

    refreshAccessToken: async () => {
      const rt = refreshToken.get();
      if (!rt) return null;
      try {
        const res = await authApi.refreshToken({ refresh_token: rt });
        accessToken.set(res.access_token, res.expires_in);
        refreshToken.set(res.refresh_token); // rotation — backend issues a new RT
        return res.access_token;
      } catch {
        return null;
      }
    },

    onAuthFailure: () => {
      useAuthStore.getState().clearSession();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    },
  });
}
