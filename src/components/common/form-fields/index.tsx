"use client";

/**
 * Generic form field wrappers that integrate React Hook Form + Zod + shadcn/ui.
 *
 * Each component wraps a <FormField> + <FormItem> + <FormLabel> + <FormControl>
 * + <FormDescription> + <FormMessage> pattern so feature forms stay concise.
 */

import * as React from "react";
import { useFormContext, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Eye, EyeOff, DollarSign, Search } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Switch } from "@/app/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Label } from "@/app/components/ui/label";

// ---------------------------------------------------------------------------
// Shared field props
// ---------------------------------------------------------------------------

export interface BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// TextField
// ---------------------------------------------------------------------------

export interface TextFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
}

export function TextField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  type = "text",
  placeholder,
  autoComplete,
}: TextFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// PasswordField
// ---------------------------------------------------------------------------

export interface PasswordFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  placeholder?: string;
  autoComplete?: string;
}

export function PasswordField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label = "Password",
  description,
  required,
  disabled,
  className,
  placeholder = "••••••••",
  autoComplete = "current-password",
}: PasswordFieldProps<T, N>) {
  const [show, setShow] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                className="pr-10"
                {...field}
                value={field.value ?? ""}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// NumberField
// ---------------------------------------------------------------------------

export interface NumberFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  placeholder,
  min,
  max,
  step,
}: NumberFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// CurrencyField
// ---------------------------------------------------------------------------

export interface CurrencyFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  placeholder?: string;
  currencySymbol?: string;
  min?: number;
}

export function CurrencyField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  placeholder = "0.00",
  currencySymbol = "$",
  min = 0,
}: CurrencyFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                step="0.01"
                className="pl-7"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                value={field.value ?? ""}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// TextareaField
// ---------------------------------------------------------------------------

export interface TextareaFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  placeholder?: string;
  rows?: number;
}

export function TextareaField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  placeholder,
  rows,
}: TextareaFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// SelectField
// ---------------------------------------------------------------------------

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  options,
  placeholder = "Select an option",
}: SelectFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            value={field.value ?? ""}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// MultiSelectField
// ---------------------------------------------------------------------------

export interface MultiSelectFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  options: SelectOption[];
  placeholder?: string;
  maxDisplay?: number;
}

export function MultiSelectField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  options,
  placeholder = "Select options…",
  maxDisplay = 3,
}: MultiSelectFieldProps<T, N>) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = field.value ?? [];

        function toggle(val: string) {
          const next = selected.includes(val)
            ? selected.filter((v) => v !== val)
            : [...selected, val];
          field.onChange(next);
        }

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between font-normal",
                      !selected.length && "text-muted-foreground"
                    )}
                  >
                    <div className="flex flex-wrap gap-1">
                      {selected.length === 0 && placeholder}
                      {selected.slice(0, maxDisplay).map((val) => {
                        const opt = options.find((o) => o.value === val);
                        return (
                          <Badge key={val} variant="secondary" className="text-xs">
                            {opt?.label ?? val}
                          </Badge>
                        );
                      })}
                      {selected.length > maxDisplay && (
                        <Badge variant="secondary" className="text-xs">
                          +{selected.length - maxDisplay}
                        </Badge>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search…" />
                  <CommandList>
                    <CommandEmpty>No options found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((opt) => (
                        <CommandItem
                          key={opt.value}
                          value={opt.value}
                          onSelect={() => toggle(opt.value)}
                          disabled={opt.disabled}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected.includes(opt.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {opt.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// SearchableSelectField (Combobox)
// ---------------------------------------------------------------------------

export interface SearchableSelectFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export function SearchableSelectField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No options found.",
}: SearchableSelectFieldProps<T, N>) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((o) => o.value === field.value);

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between font-normal",
                      !selected && "text-muted-foreground"
                    )}
                  >
                    {selected?.label ?? placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={searchPlaceholder} />
                  <CommandList>
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                      {options.map((opt) => (
                        <CommandItem
                          key={opt.value}
                          value={opt.label}
                          onSelect={() => {
                            field.onChange(opt.value);
                            setOpen(false);
                          }}
                          disabled={opt.disabled}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === opt.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {opt.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// CheckboxField
// ---------------------------------------------------------------------------

export interface CheckboxFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  checkboxLabel?: string;
}

export function CheckboxField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  checkboxLabel,
  description,
  disabled,
  className,
}: CheckboxFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <div className="flex items-start gap-3">
            <FormControl>
              <Checkbox
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                aria-label={checkboxLabel ?? label}
              />
            </FormControl>
            {checkboxLabel && (
              <Label
                htmlFor={undefined}
                className="text-sm font-normal cursor-pointer leading-snug"
                onClick={() => field.onChange(!field.value)}
              >
                {checkboxLabel}
              </Label>
            )}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// SwitchField
// ---------------------------------------------------------------------------

export interface SwitchFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  switchLabel?: string;
}

export function SwitchField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  switchLabel,
  description,
  disabled,
  className,
}: SwitchFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <div className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                aria-label={switchLabel ?? label}
              />
            </FormControl>
            {switchLabel && (
              <Label htmlFor={undefined} className="text-sm font-normal cursor-pointer">
                {switchLabel}
              </Label>
            )}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// RadioGroupField
// ---------------------------------------------------------------------------

export interface RadioGroupFieldProps<T extends FieldValues, N extends FieldPath<T>> extends BaseFieldProps<T, N> {
  options: SelectOption[];
  orientation?: "horizontal" | "vertical";
}

export function RadioGroupField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  options,
  orientation = "vertical",
}: RadioGroupFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
              className={cn(
                orientation === "horizontal" && "flex flex-row flex-wrap gap-4"
              )}
            >
              {options.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} disabled={opt.disabled} />
                  <Label htmlFor={`${name}-${opt.value}`} className="cursor-pointer font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
