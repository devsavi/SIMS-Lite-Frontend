import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// ---------------------------------------------------------------------------
// Normalised API error
// ---------------------------------------------------------------------------

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error
  );
}

function normaliseError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as Record<string, unknown> | undefined;

  const message =
    (data?.message as string) ||
    (data?.detail as string) ||
    error.message ||
    "An unexpected error occurred.";

  const code = (data?.code as string) ?? error.code;
  const errors = data?.errors as Record<string, string[]> | undefined;

  return { message, status, code, errors };
}

// ---------------------------------------------------------------------------
// Token storage — delegates to lib/auth/token.ts at runtime.
// We use a late-binding approach (functions) to avoid circular imports while
// keeping the API client free of direct auth-module dependencies.
// ---------------------------------------------------------------------------

type TokenGetter = () => string | null;
type TokenRefresher = () => Promise<string | null>;
type LogoutHandler = () => void;

let _getAccessToken: TokenGetter = () => null;
let _refreshAccessToken: TokenRefresher = async () => null;
let _onAuthFailure: LogoutHandler = () => {};

/**
 * Wire up token management after the auth module initialises.
 * Called once from the auth store.
 */
export function configureTokenHandlers(opts: {
  getAccessToken: TokenGetter;
  refreshAccessToken: TokenRefresher;
  onAuthFailure: LogoutHandler;
}) {
  _getAccessToken = opts.getAccessToken;
  _refreshAccessToken = opts.refreshAccessToken;
  _onAuthFailure = opts.onAuthFailure;
}

// Legacy in-memory store — kept for backwards-compat; replaced by token.ts
export const tokenStore = {
  get: () => _getAccessToken(),
  set: (_token: string | null) => {
    // noop: use configureTokenHandlers instead
  },
  clear: () => {
    // noop: use clearAllTokens from token.ts instead
  },
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach JWT when available
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 with token refresh
// ---------------------------------------------------------------------------

let _isRefreshing = false;
let _refreshQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

function processRefreshQueue(token: string | null, error?: unknown) {
  _refreshQueue.forEach((item) => {
    if (token) {
      item.resolve(token);
    } else {
      item.reject(error);
    }
  });
  _refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const normalisedError = normaliseError(error);

    // If 401 and we haven't already retried this request
    if (normalisedError.status === 401 && !originalRequest._retry) {
      if (_isRefreshing) {
        // Queue requests while refresh is in-flight
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const newToken = await _refreshAccessToken();
        if (newToken) {
          processRefreshQueue(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } else {
          processRefreshQueue(null, normalisedError);
          _onAuthFailure();
          return Promise.reject(normalisedError);
        }
      } catch (refreshError) {
        processRefreshQueue(null, refreshError);
        _onAuthFailure();
        return Promise.reject(normalisedError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(normalisedError);
  }
);

// ---------------------------------------------------------------------------
// Typed request helpers
// ---------------------------------------------------------------------------

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.patch<T>(url, data, config);
  return res.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}

export default apiClient;
