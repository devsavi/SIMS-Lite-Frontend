"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "../hooks/use-auth";
import { Button } from "@/app/components/ui/button";
import { isApiError } from "@/lib/api/client";

const OTP_LENGTH = 6;

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const digits = value.padEnd(OTP_LENGTH, "").split("").slice(0, OTP_LENGTH);

  const focusAt = (index: number) => {
    inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();
  };

  const handleChange = (index: number, char: string) => {
    // Allow only digits
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = digit;
    const newVal = next.join("").replace(/\s/g, "");
    onChange(newVal);
    if (digit && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = digits.slice();
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        focusAt(index - 1);
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pasted);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="flex items-center justify-center gap-2" aria-label="OTP input">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          id={`otp-digit-${i}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          autoFocus={i === 0}
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-10 rounded-md border text-center text-lg font-semibold tracking-widest",
            "bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "transition-all duration-150",
            digits[i]
              ? "border-primary bg-primary/5"
              : "border-input",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-text",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = React.useState("");

  const {
    mutate: verifyEmail,
    isPending: isVerifying,
    error: verifyError,
  } = useVerifyEmail();

  const {
    mutate: resendVerification,
    isPending: isResending,
    error: resendError,
  } = useResendVerification();

  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Start a 60-second cooldown after resend
  const startCooldown = React.useCallback(() => {
    setResendCooldown(60);
  }, []);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length < OTP_LENGTH) return;
    verifyEmail({ email, otp });
  };

  const handleResend = () => {
    if (!email || resendCooldown > 0 || isResending) return;
    startCooldown();
    resendVerification(email);
  };

  const verifyErrorMessage =
    verifyError && isApiError(verifyError) ? verifyError.message : null;
  const resendErrorMessage =
    resendError && isApiError(resendError) ? resendError.message : null;

  if (!email) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-destructive">
          Missing email address. Please register again or go back to login.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Verify your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-foreground break-all">{email}</p>
        </div>
      </div>

      {/* Error banners */}
      {(verifyErrorMessage || resendErrorMessage) && (
        <div
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive rounded-md"
        >
          {verifyErrorMessage || resendErrorMessage}
        </div>
      )}

      {/* OTP input */}
      <div className="space-y-3">
        <OtpInput value={otp} onChange={setOtp} disabled={isVerifying || isResending} />
        <p className="text-center text-xs text-muted-foreground">
          Enter the 6-digit code from your email
        </p>
      </div>

      {/* Submit */}
      <Button
        id="verify-email-submit"
        type="submit"
        className="w-full"
        disabled={isVerifying || isResending || otp.length < OTP_LENGTH}
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Verify Email
          </>
        )}
      </Button>

      {/* Resend */}
      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          id="verify-email-resend"
          disabled={resendCooldown > 0 || isResending || isVerifying}
          onClick={handleResend}
          className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline font-medium"
        >
          {isResending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Resend code"}
        </button>
      </div>

      {/* Back to login */}
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
