"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/utils/cn";
import { Button } from "@/app/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";

// ---------------------------------------------------------------------------
// DateRangePicker
// ---------------------------------------------------------------------------

export interface DateRangePickerProps {
  /** Selected date range */
  value?: DateRange;
  /** Called when the date range changes */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Disallow dates before this date */
  fromDate?: Date;
  /** Disallow dates after this date */
  toDate?: Date;
  /** Number of months to display */
  numberOfMonths?: 1 | 2;
  className?: string;
}

/**
 * DateRangePicker — a popover-based date range selector.
 *
 * @example
 * <DateRangePicker
 *   value={range}
 *   onChange={setRange}
 *   placeholder="Pick a date range"
 * />
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled = false,
  fromDate,
  toDate,
  numberOfMonths = 2,
  className,
}: DateRangePickerProps) {
  function formatRange(range: DateRange | undefined): string {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, "MMM d, yyyy");
    return `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`;
  }

  const hasValue = !!value?.from;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start gap-2 font-normal",
            !hasValue && "text-muted-foreground",
            className
          )}
          aria-label={hasValue ? `Date range: ${formatRange(value)}` : placeholder}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">{formatRange(value)}</span>
          {hasValue && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date range"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange?.(undefined);
                }
              }}
              className="ml-auto rounded-none hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={numberOfMonths}
          fromDate={fromDate}
          toDate={toDate}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// DatePickerField — single-date form field version
// ---------------------------------------------------------------------------

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  fromDate,
  toDate,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start gap-2 font-normal",
            !value && "text-muted-foreground",
            className
          )}
          aria-label={value ? format(value, "MMM d, yyyy") : placeholder}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{value ? format(value, "MMM d, yyyy") : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          fromDate={fromDate}
          toDate={toDate}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
