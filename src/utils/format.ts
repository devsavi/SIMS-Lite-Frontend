import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { useSystemSettingsStore } from "@/stores/settings.store";

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

function getSystemDateFormat(): string {
  try {
    const storeFormat = useSystemSettingsStore.getState().dateFormat;
    if (storeFormat === "DD/MM/YYYY") return "dd/MM/yyyy";
    if (storeFormat === "MM/DD/YYYY") return "MM/dd/yyyy";
    return "yyyy-MM-dd";
  } catch {
    return "yyyy-MM-dd";
  }
}

export function formatDate(
  date: string | Date | null | undefined,
  pattern?: string
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, pattern || getSystemDateFormat());
}

export function formatDateTime(
  date: string | Date | null | undefined
): string {
  const timePattern = "h:mm a";
  return `${formatDate(date)} ${date ? format(typeof date === "string" ? parseISO(date) : date, timePattern) : ""}`;
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

