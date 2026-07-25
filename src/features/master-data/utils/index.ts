/**
 * Master Data — utilities
 */

/**
 * Converts empty string values in an object to null.
 * Used before submitting form data to the API.
 */
export function emptyToNull<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
  ) as T;
}

/**
 * Returns a display name for an entity combining company/first name fields.
 */
export function getDisplayName(
  entity: { name?: string; company_name?: string } | null | undefined
): string {
  if (!entity) return "—";
  return entity.name ?? entity.company_name ?? "—";
}
