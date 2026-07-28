"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useDebounce } from "@/hooks/use-debounce";

// ---------------------------------------------------------------------------
// SearchInput
// ---------------------------------------------------------------------------

export interface SearchInputProps {
  /** Controlled value */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;
  /** Called with the debounced search value */
  onSearch?: (value: string) => void;
  /** Called immediately on every keystroke (bypasses debounce) */
  onChange?: (value: string) => void;
  /** Debounce delay in ms. Defaults to 300 */
  debounceMs?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** aria-label for the input */
  "aria-label"?: string;
}

/**
 * SearchInput — debounced search field with clear button.
 *
 * @example
 * <SearchInput
 *   placeholder="Search products…"
 *   onSearch={(q) => setQuery(q)}
 * />
 */
export function SearchInput({
  value: controlledValue,
  defaultValue = "",
  onSearch,
  onChange,
  debounceMs = 300,
  placeholder = "Search…",
  className,
  disabled,
  "aria-label": ariaLabel,
}: SearchInputProps) {
  const isControlled = controlledValue !== undefined;
  const [localValue, setLocalValue] = React.useState(
    isControlled ? (controlledValue ?? "") : defaultValue
  );

  const displayValue = isControlled ? (controlledValue ?? "") : localValue;

  const debouncedValue = useDebounce(displayValue, debounceMs);

  // Fire onSearch when debounced value changes
  const prevDebounced = React.useRef(debouncedValue);
  React.useEffect(() => {
    if (debouncedValue !== prevDebounced.current) {
      prevDebounced.current = debouncedValue;
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) setLocalValue(val);
    onChange?.(val);
  }, [isControlled, onChange]);

  const handleClear = React.useCallback(() => {
    if (!isControlled) setLocalValue("");
    onChange?.("");
    onSearch?.("");
  }, [isControlled, onChange, onSearch]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        role="searchbox"
        aria-label={ariaLabel ?? placeholder}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-9 w-full border border-input bg-transparent py-1 pl-9 pr-9 text-sm shadow-sm transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-search-cancel-button]:hidden"
        )}
      />
      {displayValue && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          disabled={disabled}
          className="absolute right-3 rounded-none text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
