"use client";

import * as React from "react";
import { GuestRoute } from "@/app/components/auth/GuestRoute";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <div className="border border-border bg-card p-6 shadow-sm">
        <React.Suspense fallback={null}>
          <ResetPasswordForm />
        </React.Suspense>
      </div>
    </GuestRoute>
  );
}
