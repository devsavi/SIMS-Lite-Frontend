/**
 * Token management — secure, Next.js-compatible token storage.
 *
 * Strategy:
 * - Access token: in-memory only (never persisted to localStorage / cookies
 *   from this module). The API client reads it via the exported helpers.
 * - Refresh token: stored in localStorage under a non-obvious key, protected
 *   from XSS by keeping it out of the main memory path as much as possible.
 *   (httpOnly cookie approach would require a custom Next.js API route acting
 *   as a proxy — deferred to a future security hardening sprint.)
 *
 * The refresh token key is a constant known only to this module.
 */

const REFRESH_TOKEN_KEY = "__sims_rt__";
const TOKEN_EXPIRY_KEY = "__sims_exp__";
const USER_KEY = "__sims_usr__";

// ---------------------------------------------------------------------------
// In-memory access token (never touches localStorage)
// ---------------------------------------------------------------------------

let _accessToken: string | null = null;

export const accessToken = {
  get: () => _accessToken,

  set: (token: string, expiresIn: number) => {
    _accessToken = token;
    const expiry = Date.now() + expiresIn * 1000;
    try {
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
    } catch {
      // sessionStorage not available (SSR / private browsing)
    }
  },

  clear: () => {
    _accessToken = null;
    try {
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch {
      // ignore
    }
  },

  isExpired: (): boolean => {
    try {
      const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return true;
      return Date.now() >= Number(expiry) - 30_000; // 30s buffer
    } catch {
      return true;
    }
  },
};

// ---------------------------------------------------------------------------
// Refresh token (localStorage)
// ---------------------------------------------------------------------------

export const refreshToken = {
  get: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set: (token: string) => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // ignore write failures
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

// ---------------------------------------------------------------------------
// Persisted user (localStorage) — needed to restore full session on reload
// ---------------------------------------------------------------------------

export const persistedUser = {
  get: <T>(): T | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set: (user: unknown) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

export function clearAllTokens(): void {
  accessToken.clear();
  refreshToken.clear();
  persistedUser.clear();
  try {
    localStorage.removeItem("sims-session");
  } catch {
    // ignore
  }
}

export function isSessionValid(): boolean {
  return !!accessToken.get() && !accessToken.isExpired();
}
