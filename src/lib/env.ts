/**
 * Environment variable validation.
 * Uses static process.env.NEXT_PUBLIC_* references so Next.js / Turbopack
 * can statically inline them into client-side bundles.
 */

function getEnv(value: string | undefined, name: string, fallback: string): string {
  const val = value ?? (typeof process !== "undefined" ? process.env[name] : undefined);
  if (!val) {
    if (process.env.NODE_ENV !== "production") {
      return fallback;
    }
    throw new Error(
      `[env] Missing required environment variable: ${name}\n` +
        `Please copy .env.example to .env.local and fill in the values.`
    );
  }
  return val;
}

export const env = {
  apiUrl: getEnv(
    process.env.NEXT_PUBLIC_API_URL,
    "NEXT_PUBLIC_API_URL",
    "http://localhost:8001/api/v1"
  ),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "SIMS Lite",
  wsUrl: getEnv(
    process.env.NEXT_PUBLIC_WS_URL,
    "NEXT_PUBLIC_WS_URL",
    "ws://localhost:8001/api/v1/ws"
  ),
} as const;

export type Env = typeof env;

