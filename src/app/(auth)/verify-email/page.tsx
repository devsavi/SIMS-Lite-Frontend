"use client";

import * as React from "react";
import { GuestRoute } from "@/app/components/auth/GuestRoute";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <GuestRoute>
      <div className="border border-border bg-card p-6 shadow-sm">
        <React.Suspense fallback={null}>
          <VerifyEmailForm />
        </React.Suspense>
      </div>
    </GuestRoute>
  );
}
