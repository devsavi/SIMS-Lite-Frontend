/**
 * Environment variable validation.
 * The application will throw at startup if required variables are missing.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${key}\n` +
        `Please copy .env.example to .env.local and fill in the values.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  apiUrl: requireEnv("NEXT_PUBLIC_API_URL"),
  appName: optionalEnv("NEXT_PUBLIC_APP_NAME", "SIMS Lite"),
  wsUrl: requireEnv("NEXT_PUBLIC_WS_URL"),
} as const;

export type Env = typeof env;
