/**
 * Auth feature — TypeScript types
 * Aligned with the backend API (snake_case, wrapped in { status, data }).
 */

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ---------------------------------------------------------------------------
// Responses — raw API shapes (snake_case, wrapped in SuccessResponse)
// ---------------------------------------------------------------------------

/** SuccessResponse<T> wrapper the backend puts around every 2xx payload */
export interface SuccessResponse<T> {
  status: "success";
  data: T;
}

/** TokenResponse — returned by /auth/login and /auth/refresh */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/** RoleReadSummary — minimal role shape embedded in UserRead */
export interface RoleReadSummary {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
}

/** UserRead — returned by /auth/me and /auth/register */
export interface UserRead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  last_login: string | null;
  roles: RoleReadSummary[];
  created_at: string;
  updated_at: string;
}

export interface MessageResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Legacy — kept for backwards-compat with any callers still using these names
// ---------------------------------------------------------------------------

/** @deprecated Use TokenResponse instead */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

/** @deprecated Use UserRead instead */
export type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

/** @deprecated Use SuccessResponse<TokenResponse & { user: UserRead }> */
export type AuthResponse = {
  user: AuthUserResponse;
  tokens: AuthTokens;
};

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}
