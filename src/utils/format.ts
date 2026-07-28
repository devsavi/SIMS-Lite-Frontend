import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

export function formatDate(
  date: string | Date | null | undefined,
  pattern = "MMM d, yyyy"
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, pattern);
}

export function formatDateTime(
  date: string | Date | null | undefined
): string {
  return formatDate(date, "MMM d, yyyy h:mm a");
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return formatDistanceToNow(d, { addSuffix: true });
}

// ---------------------------------------------------------------------------
// Number / currency formatting
// ---------------------------------------------------------------------------

export function formatCurrency(
  amount: number | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(
  value: number | null | undefined,
  locale = "en-US"
): string {
  if (value == null) return "—";
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value == null) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(
  value: number | null | undefined,
  locale = "en-US"
): string {
  if (value == null) return "—";
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

export function truncate(str: string, maxLength: number): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function capitalise(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .split(/[\s_-]+/)
    .map(capitalise)
    .join(" ");
}

