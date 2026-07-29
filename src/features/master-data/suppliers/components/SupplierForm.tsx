"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { supplierSchema, type SupplierFormValues } from "../../schemas";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/app/components/ui/form";
import { TextField, TextareaField } from "@/components/common/form-fields";
import { isApiError } from "@/lib/api/client";

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormValues>;
  editingId?: string;
  onSubmit: (values: SupplierFormValues) => Promise<void>;
  onCancel: () => void;
  error?: unknown;
  isPending?: boolean;
}

export function SupplierForm({ defaultValues, editingId, onSubmit, onCancel, error, isPending }: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      company_name: "",
      contact_person: "",
      email: "",
      address: "",
      city: "",
      country: "",
      notes: "",
      is_active: true,
      ...defaultValues,
      phone: defaultValues?.phone || "+94",
    },
  });

  const apiError = error && isApiError(error) ? error : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
        {apiError && (
          <div role="alert" className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {apiError.message}
          </div>
        )}

        {/* Company */}
        <TextField
          control={form.control}
          name="company_name"
          label="Company Name"
          placeholder="e.g. Acme Supplies Ltd."
          required
          autoComplete="organization"
        />

        {/* Contact */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="contact_person"
            label="Contact Person"
            placeholder="e.g. Jane Smith"
            autoComplete="name"
          />
          <TextField
            control={form.control}
            name="phone"
            label="Phone"
            placeholder="+1 555 000 0000"
            type="tel"
            autoComplete="tel"
          />
        </div>

        <TextField
          control={form.control}
          name="email"
          label="Email"
          placeholder="contact@example.com"
          type="email"
          autoComplete="email"
        />

        {/* Address */}
        <TextareaField
          control={form.control}
          name="address"
          label="Address"
          placeholder="Street address"
          rows={2}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="city" label="City" placeholder="e.g. New York" />
          <TextField control={form.control} name="country" label="Country" placeholder="e.g. United States" />
        </div>

        <TextareaField
          control={form.control}
          name="notes"
          label="Notes"
          placeholder="Internal notes (not visible to supplier)"
          rows={3}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-none border border-border p-3">
              <div>
                <FormLabel className="text-sm font-medium">Active</FormLabel>
                <FormDescription className="text-xs">Inactive suppliers cannot be used in new purchase orders.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Supplier active status" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingId ? "Save Changes" : "Create Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
