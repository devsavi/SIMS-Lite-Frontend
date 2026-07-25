"use client";

/**
 * Auth hooks — TanStack Query wrappers around auth API calls.
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "../api/auth-api";
import type { UserRead } from "../types";
import type { AuthUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function userReadToAuthUser(u: UserRead): AuthUser {
  // Backend uses roles[] array; pick the first role name as the primary role.
  const roleName = u.roles?.[0]?.name ?? "viewer";
  return {
    id: u.id,
    name: u.full_name || `${u.first_name} ${u.last_name}`.trim() || u.email,
    email: u.email,
    role: roleName as AuthUser["role"],
    avatar: undefined,
  };
}

// ---------------------------------------------------------------------------
// useLogin
// ---------------------------------------------------------------------------

export function useLogin() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (values: { email: string; password: string; rememberMe?: boolean }) => {
      // 1. Exchange credentials for tokens (backend doesn't accept rememberMe)
      const tokens = await authApi.login({ email: values.email, password: values.password });
      // 2. Store access token in memory so the /me call is authenticated
      const { accessToken } = await import("@/lib/auth/token");
      accessToken.set(tokens.access_token, tokens.expires_in);
      // 3. Fetch user profile
      const user = await authApi.me();
      return { tokens, user };
    },
    onSuccess: ({ tokens, user }) => {
      login(userReadToAuthUser(user), {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      });
      // Hard navigation — bypasses any React render-cycle timing issues
      window.location.replace("/dashboard");
    },
  });
}

// ---------------------------------------------------------------------------
// useRegister
// ---------------------------------------------------------------------------

export function useRegister() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (values: {
      name: string;
      email: string;
      password: string;
    }) => {
      // Split "Full Name" into first/last for the backend
      const parts = values.name.trim().split(/\s+/);
      const first_name = parts[0] ?? values.name;
      const last_name = parts.slice(1).join(" ") || first_name;

      const tokens = await authApi.register({ email: values.email, password: values.password, first_name, last_name });
      const { accessToken } = await import("@/lib/auth/token");
      accessToken.set(tokens.access_token, tokens.expires_in);
      const user = await authApi.me();
      return { tokens, user };
    },
    onSuccess: ({ tokens, user }) => {
      login(userReadToAuthUser(user), {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      });
      window.location.replace("/dashboard");
    },
  });
}

// ---------------------------------------------------------------------------
// useLogout
// ---------------------------------------------------------------------------

export function useLogout() {
  const { logout } = useAuthStore();
  return { logout };
}

// ---------------------------------------------------------------------------
// useForgotPassword
// ---------------------------------------------------------------------------

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

// ---------------------------------------------------------------------------
// useResetPassword
// ---------------------------------------------------------------------------

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      router.replace("/login");
    },
  });
}
