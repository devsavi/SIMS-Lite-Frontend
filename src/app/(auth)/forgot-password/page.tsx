"use client";

import { GuestRoute } from "@/app/components/auth/GuestRoute";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <GuestRoute>
      <div className="border border-border bg-card p-6 shadow-sm">
        <ForgotPasswordForm />
      </div>
    </GuestRoute>
  );
}
