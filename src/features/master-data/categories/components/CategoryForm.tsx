"use client";

/**
 * CategoryForm — reusable create/edit form for categories.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { categorySchema, type CategoryFormValues } from "../../schemas";
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

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  editingId?: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
  error?: unknown;
  isPending?: boolean;
}

export function CategoryForm({
  defaultValues,
  editingId,
  onSubmit,
  onCancel,
  error,
  isPending,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: null,
      is_active: true,
      ...defaultValues,
    },
  });

  const apiError = error && isApiError(error) ? error : null;

  async function handleSubmit(values: CategoryFormValues) {
    // parent_id is always null — field is not exposed in the form
    await onSubmit({ ...values, parent_id: null });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-5">
        {/* API error banner */}
        {apiError && (
          <div role="alert" className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {apiError.message}
          </div>
        )}

        <TextField
          control={form.control}
          name="name"
          label="Name"
          placeholder="e.g. Paper"
          required
          autoComplete="off"
        />

        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Optional description"
          rows={3}
        />

        {/* Active toggle — only shown when editing */}
        {editingId && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-none border border-border p-3">
                <div>
                  <FormLabel className="text-sm font-medium">Active</FormLabel>
                  <FormDescription className="text-xs">
                    Inactive categories will not appear in product forms.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Category active status"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {editingId ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
