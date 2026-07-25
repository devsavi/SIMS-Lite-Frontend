"use client";

/**
 * SessionProvider — runs once on initial app load to restore a session
 * from a persisted refresh token.
 *
 * Uses a module-level flag (`_sessionRestored`) so the async restore only
 * runs once per browser session, not on every client-side navigation.
 */

import * as React from "react";
import { useAuthStore, initAuthClient } from "@/stores/auth.store";
import { accessToken, refreshToken, persistedUser } from "@/lib/auth/token";
import { authApi } from "@/features/auth/api/auth-api";
import type { AuthUser } from "@/lib/auth";
import type { UserRead } from "@/features/auth/types";

function userReadToAuthUser(u: UserRead): AuthUser {
  const roleName = u.roles?.[0]?.name ?? "viewer";
  return {
    id: u.id,
    name: u.full_name || `${u.first_name} ${u.last_name}`.trim() || u.email,
    email: u.email,
    role: roleName as AuthUser["role"],
    avatar: undefined,
  };
}

// Module-level flag — survives client-side navigations (unlike component state)
let _sessionRestored = false;

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  // hydrated = false only on the very first mount of the whole app
  const [hydrated, setHydrated] = React.useState(_sessionRestored);

  React.useEffect(() => {
    initAuthClient();

    // Already restored in this browser session — nothing to do
    if (_sessionRestored) {
      setHydrated(true);
      return;
    }

    async function restoreSession() {
      const rt = refreshToken.get();

      if (!rt) {
        // No stored session
        _sessionRestored = true;
        setHydrated(true);
        return;
      }

      // Access token still valid in memory (e.g. React strict-mode double mount)
      if (accessToken.get() && !accessToken.isExpired()) {
        // Restore user from persisted storage if store is empty
        const storeUser = useAuthStore.getState().user;
        if (!storeUser) {
          const stored = persistedUser.get<UserRead>();
          if (stored && stored.id) {
            useAuthStore.getState().login(userReadToAuthUser(stored), {
              accessToken: accessToken.get()!,
              refreshToken: rt,
              expiresIn: 900,
            });
          }
        }
        _sessionRestored = true;
        setHydrated(true);
        return;
      }

      try {
        // Exchange refresh token for a new token pair
        const tokenRes = await authApi.refreshToken({ refresh_token: rt });
        accessToken.set(tokenRes.access_token, tokenRes.expires_in);
        refreshToken.set(tokenRes.refresh_token); // rotation

        // Try persisted user first (avoids an extra network call)
        const stored = persistedUser.get<UserRead>();
        if (stored && stored.id && stored.email) {
          useAuthStore.getState().login(userReadToAuthUser(stored), {
            accessToken: tokenRes.access_token,
            refreshToken: tokenRes.refresh_token,
            expiresIn: tokenRes.expires_in,
          });
        } else {
          // Fallback: fetch fresh profile from /auth/me
          try {
            const user = await authApi.me();
            useAuthStore.getState().login(userReadToAuthUser(user), {
              accessToken: tokenRes.access_token,
              refreshToken: tokenRes.refresh_token,
              expiresIn: tokenRes.expires_in,
            });
          } catch {
            useAuthStore.getState().clearSession();
          }
        }
      } catch {
        // Refresh failed — clear everything and redirect to login
        useAuthStore.getState().clearSession();
      } finally {
        _sessionRestored = true;
        setHydrated(true);
      }
    }

    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
