/**
 * Auth feature — API calls
 * All paths relative to NEXT_PUBLIC_API_URL (e.g. http://localhost:8001/api/v1)
 *
 * The backend wraps every 2xx response in { status: "success", data: ... }.
 * Helpers here unwrap that envelope and return the inner `data` directly.
 */

import { post, get } from "@/lib/api/client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SuccessResponse,
  TokenResponse,
  UserRead,
} from "../types";

const AUTH = "/auth";

export const authApi = {
  /**
   * POST /auth/login
   * Returns token pair (no user — call /auth/me separately).
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await post<SuccessResponse<TokenResponse>>(`${AUTH}/login`, data);
    return res.data;
  },

  /**
   * GET /auth/me
   * Returns the authenticated user's profile.
   */
  me: async (): Promise<UserRead> => {
    const res = await get<SuccessResponse<UserRead>>(`${AUTH}/me`);
    return res.data;
  },

  /**
   * POST /auth/register
   * Creates account and returns token pair (no user in response — call /auth/me).
   */
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await post<SuccessResponse<TokenResponse>>(`${AUTH}/register`, data);
    return res.data;
  },

  /**
   * POST /auth/refresh
   * Exchanges a valid refresh token for a new token pair.
   * Field name is refresh_token (snake_case) per backend schema.
   *
   * Uses _skipAuthRetry to prevent the response interceptor from attempting
   * another token refresh when this call itself returns 401 (expired RT).
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    const res = await post<SuccessResponse<TokenResponse>>(`${AUTH}/refresh`, data, {
      // @ts-expect-error — custom flag read by the response interceptor
      _skipAuthRetry: true,
    });
    return res.data;
  },

  /**
   * POST /auth/logout
   * Invalidates the refresh token server-side.
   */
  logout: async (rt: string): Promise<void> => {
    try {
      await post<SuccessResponse<MessageResponse>>(`${AUTH}/logout`, {
        refresh_token: rt,
      });
    } catch {
      // Best-effort — clear local state regardless
    }
  },

  /**
   * POST /auth/forgot-password
   * Sends a password-reset email.
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const res = await post<SuccessResponse<MessageResponse>>(
      `${AUTH}/forgot-password`,
      data
    );
    return res.data;
  },

  /**
   * POST /auth/reset-password
   * Resets the password using the token from email.
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const res = await post<SuccessResponse<MessageResponse>>(
      `${AUTH}/reset-password`,
      data
    );
    return res.data;
  },

  /**
   * GET /auth/verify-email
   * Verifies the email using OTP from email.
   */
  verifyEmail: async (email: string, otp: string): Promise<MessageResponse> => {
    const res = await get<SuccessResponse<MessageResponse>>(
      `${AUTH}/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    );
    return res.data;
  },

  /**
   * POST /auth/resend-verification
   * Resends the verification email.
   */
  resendVerification: async (email: string): Promise<MessageResponse> => {
    const res = await post<SuccessResponse<MessageResponse>>(
      `${AUTH}/resend-verification`,
      { email }
    );
    return res.data;
  },
};
