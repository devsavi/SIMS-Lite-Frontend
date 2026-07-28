/**
 * Security Sanitizer & Input Encoding Utilities.
 *
 * Provides defense-in-depth sanitization for user input, rendering strings,
 * URLs, filenames, and sensitive log objects.
 */

/**
 * Escapes special HTML characters to prevent XSS injection.
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes filenames by removing path traversal characters and restricted characters.
 * Useful for user-uploaded files or downloaded export filenames.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "unnamed_file";

  // Replace directory separators and relative path markers with underscores
  let cleaned = filename.replace(/[/\\]+/g, "_").replace(/\.\./g, "");

  // Remove spaces and non-word characters (keep alphanumeric, dot, and hyphen)
  cleaned = cleaned.replace(/[^\w.-]/gi, "_");

  // Collapse multiple consecutive underscores
  cleaned = cleaned.replace(/_+/g, "_");

  // Strip trailing underscore before extension dot (e.g. "final_.pdf" -> "final.pdf")
  cleaned = cleaned.replace(/_\./g, ".");

  // Trim leading and trailing underscores and dots
  cleaned = cleaned.replace(/^[_.-]+/, "").replace(/[_.-]+$/, "");

  return cleaned || "unnamed_file";
}

/**
 * Validates and sanitizes dynamic URLs to prevent javascript: or data: XSS vectors.
 * Only allows http:, https:, mailto:, or relative paths starting with /
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "#";
  const trimmed = url.trim();

  // Reject protocol-relative protocol smuggling URLs starting with //
  if (trimmed.startsWith("//")) {
    return "#";
  }

  // Allow relative URLs starting with /
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") {
      return trimmed;
    }
  } catch {
    // Malformed URL
  }

  return "#";
}

const SENSITIVE_KEYS = [
  "password",
  "old_password",
  "new_password",
  "confirm_password",
  "access_token",
  "refresh_token",
  "token",
  "secret",
  "authorization",
  "credit_card",
  "card_number",
  "cvv",
];

/**
 * Redacts sensitive fields from an object for logging or diagnostic output.
 */
export function redactSensitiveData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item)) as unknown as T;
  }

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(
      (sk) =>
        lowerKey === sk ||
        (sk !== "token" && lowerKey.includes(sk)) ||
        (sk === "token" && (lowerKey === "token" || lowerKey.endsWith("_token") || lowerKey.startsWith("token_")))
    );

    if (isSensitive) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted as T;
}
