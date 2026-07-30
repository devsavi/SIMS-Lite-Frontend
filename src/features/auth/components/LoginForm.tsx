"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ShieldCheck, MailCheck, Lock } from "lucide-react";
import { loginSchema, type LoginFormValues } from "../schemas";
import { useLogin, useResendVerification } from "../hooks/use-auth";
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

const UNVERIFIED_MESSAGE =
  "Your email address has not been verified. Please check your inbox for the verification email.";

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const { mutate: login, isPending, error } = useLogin();
  const {
    mutate: resendVerification,
    isPending: isResending,
  } = useResendVerification();

  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  const apiError =
    error && isApiError(error) ? error : null;
  const apiErrorMessage = apiError?.message ?? null;

  // Detect specific error codes
  const isUnverifiedError = apiErrorMessage === UNVERIFIED_MESSAGE;
  const isDeactivatedError = apiError?.code === "FORBIDDEN";

  // Get the email entered in the form so we can resend to it
  const emailValue = form.watch("email");

  const handleVerifyEmail = () => {
    if (!emailValue) return;
    resendVerification(emailValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Email verified success banner */}
        {justVerified && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
          >
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Your email has been verified! You can now sign in.</span>
          </div>
        )}

        {/* Deactivated account banner */}
        {isDeactivatedError && !justVerified && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
          >
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Account Deactivated</p>
              <p className="mt-0.5 text-xs opacity-90">
                {apiErrorMessage ?? "Your account has been deactivated. Please contact support for assistance."}
              </p>
            </div>
          </div>
        )}

        {/* Generic API error banner */}
        {apiErrorMessage && !justVerified && !isDeactivatedError && (
          <div
            role="alert"
            className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive rounded-md"
          >
            {apiErrorMessage}

            {/* Verify Email button — only when unverified error */}
            {isUnverifiedError && (
              <div className="mt-3">
                <Button
                  id="login-verify-email-btn"
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isResending || !emailValue}
                  onClick={handleVerifyEmail}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>
                {!emailValue && (
                  <p className="mt-1.5 text-xs text-muted-foreground text-center">
                    Enter your email above first, then click Verify Email.
                  </p>
                )}
              </div>
            )}
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
                  disabled={isPending || isResending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending || isResending}
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember me */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isPending || isResending}
                  className="h-4 w-4 border-input accent-primary"
                />
              </FormControl>
              <FormLabel htmlFor="rememberMe" className="cursor-pointer text-sm font-normal">
                Remember me
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isPending || isResending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </Form>
  );
}
