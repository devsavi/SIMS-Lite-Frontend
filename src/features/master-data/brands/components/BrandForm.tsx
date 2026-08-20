"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { brandSchema, type BrandFormValues } from "../../schemas";
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

interface BrandFormProps {
  defaultValues?: Partial<BrandFormValues>;
  editingId?: string;
  onSubmit: (values: BrandFormValues) => Promise<void>;
  onCancel: () => void;
  error?: unknown;
  isPending?: boolean;
}

export function BrandForm({ defaultValues, editingId, onSubmit, onCancel, error, isPending }: BrandFormProps) {
  const isEditing = !!editingId;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      description: "",
      logo_url: "",
      website_url: "",
      is_active: true,
      ...defaultValues,
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

        <TextField control={form.control} name="name" label="Name" placeholder="e.g. Prima" required autoComplete="off" />
        <TextareaField control={form.control} name="description" label="Description" placeholder="Optional brand description" rows={3} />
        <TextField control={form.control} name="website_url" label="Website" placeholder="https://example.com" type="url" />
        <TextField control={form.control} name="logo_url" label="Logo URL" placeholder="https://example.com/logo.png" type="url" />

        {isEditing && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-none border border-border p-3">
                <div>
                  <FormLabel className="text-sm font-medium">Active</FormLabel>
                  <FormDescription className="text-xs">Inactive brands will not appear in product forms.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Brand active status" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingId ? "Save Changes" : "Create Brand"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
