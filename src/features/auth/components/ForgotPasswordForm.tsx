"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas";
import { useForgotPassword } from "../hooks/use-auth";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { isApiError } from "@/lib/api/client";

export function ForgotPasswordForm() {
  const { mutate: requestReset, isPending, error, isSuccess } = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordFormValues) {
    requestReset(values);
  }

  const apiErrorMessage =
    error && isApiError(error) ? error.message : null;

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Check your email</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">
              {form.getValues("email")}
            </span>
            , you will receive a reset link shortly.
          </p>
        </div>
        <Link
          href="/login"
          className="block text-sm text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold text-foreground">Forgot password?</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* API error */}
        {apiErrorMessage && (
          <div
            role="alert"
            className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {apiErrorMessage}
          </div>
        )}

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
