import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely, handling conflicts.
 * Re-exported from components/ui as well for convenience.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
