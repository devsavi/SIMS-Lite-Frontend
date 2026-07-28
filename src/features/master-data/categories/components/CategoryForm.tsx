"use client";

/**
 * CategoryForm — reusable create/edit form for categories.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { categorySchema, type CategoryFormValues } from "../../schemas";
import { useCategories } from "../../hooks/use-categories";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { isApiError } from "@/lib/api/client";
import type { Category } from "../../types";

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
  // Load parent category options (flat list, exclude self if editing)
  const { data: categoriesData } = useCategories({ page: 1, page_size: 100, is_active: true });

  const parentOptions = React.useMemo(() => {
    const cats = categoriesData?.data ?? [];
    return cats
      .filter((c: Category) => c.id !== editingId)
      .map((c: Category) => ({ label: c.name, value: c.id }));
  }, [categoriesData, editingId]);

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
    await onSubmit(values);
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
          placeholder="e.g. Electronics"
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

        {/* Parent category — custom handling for nullable value */}
        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === "__none__" ? null : v)}
                value={field.value ?? "__none__"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">None (top-level)</SelectItem>
                  {parentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active toggle */}
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
