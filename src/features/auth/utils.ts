/**
 * Auth feature — shared utilities.
 */

import type { AuthUser, UserRole } from "@/lib/auth";
import type { UserRead } from "./types";

// ---------------------------------------------------------------------------
// Role name normalization
//
// The backend returns role names in UPPER_SNAKE_CASE (e.g. "ADMIN",
// "OFFICER", "STORE_KEEPER"). The frontend UserRole type uses lower_snake_case
// (e.g. "admin", "officer", "store_keeper"). Normalise here so every
// permission check, sidebar filter, and guard works correctly.
// ---------------------------------------------------------------------------

const ROLE_NAME_MAP: Record<string, UserRole> = {
  ADMIN: "admin",
  OFFICER: "officer",
  STORE_KEEPER: "store_keeper",
};

function normalizeRoleName(raw: string): UserRole {
  const upper = raw.toUpperCase().replace(/[^A-Z_]/g, "_");
  return ROLE_NAME_MAP[upper] ?? (raw.toLowerCase() as UserRole);
}

// ---------------------------------------------------------------------------
// userReadToAuthUser
// ---------------------------------------------------------------------------

/**
 * Converts the raw API UserRead shape into the frontend AuthUser shape.
 * Picks the first role in the array and normalises its name to lowercase.
 */
export function userReadToAuthUser(u: UserRead): AuthUser {
  const rawRoleName = u.roles?.[0]?.name ?? "STORE_KEEPER";
  return {
    id: u.id,
    name: u.full_name || `${u.first_name} ${u.last_name}`.trim() || u.email,
    email: u.email,
    role: normalizeRoleName(rawRoleName),
    avatar: u.avatar_url ?? u.avatar ?? undefined,
    is_superuser: u.is_superuser,
  };
}
