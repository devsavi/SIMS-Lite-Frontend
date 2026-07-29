"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile-api";
import { useAuthStore } from "@/stores/auth.store";
import type { UpdateProfileDTO, ChangePasswordDTO } from "../types";

export const PROFILE_QUERY_KEYS = {
  profile: ["profile", "me"] as const,
  sessions: ["profile", "sessions"] as const,
  activities: ["profile", "activities"] as const,
};

export function useProfile() {
  const storeUser = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: async () => {
      const data = await profileApi.getProfile();
      if (storeUser) {
        return {
          ...data,
          name: data.name || storeUser.name,
          email: data.email || storeUser.email,
          role: data.role || storeUser.role,
          avatar: data.avatar || storeUser.avatar,
        };
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser, user } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => profileApi.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile, updated);

      if (user) {
        setUser({
          ...user,
          name: updated.name,
          email: updated.email,
          avatar: updated.avatar,
        });
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDTO) => profileApi.changePassword(data),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.sessions,
    queryFn: profileApi.getSessions,
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.revokeOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.sessions });
    },
  });
}

export function useActivityLogs(filters: import("../types").ActivityLogFilters) {
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEYS.activities, filters],
    queryFn: () => profileApi.getActivityLogs(filters),
  });
}
