/**
 * Production Security Logger.
 *
 * Wraps console logging to sanitize payloads and suppress verbose diagnostic
 * output in production environments.
 */

import { redactSensitiveData } from "./sanitizer";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const logger = {
  debug: (...args: unknown[]) => {
    if (!IS_PRODUCTION) {
      const sanitized = args.map((arg) => (typeof arg === "object" ? redactSensitiveData(arg) : arg));
      console.debug("[DEBUG]", ...sanitized);
    }
  },

  info: (...args: unknown[]) => {
    if (!IS_PRODUCTION) {
      const sanitized = args.map((arg) => (typeof arg === "object" ? redactSensitiveData(arg) : arg));
      console.info("[INFO]", ...sanitized);
    }
  },

  warn: (...args: unknown[]) => {
    const sanitized = args.map((arg) => (typeof arg === "object" ? redactSensitiveData(arg) : arg));
    console.warn("[WARN]", ...sanitized);
  },

  error: (...args: unknown[]) => {
    const sanitized = args.map((arg) => (typeof arg === "object" ? redactSensitiveData(arg) : arg));
    console.error("[ERROR]", ...sanitized);
  },
};
