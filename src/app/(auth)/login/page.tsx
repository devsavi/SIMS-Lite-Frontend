"use client";

import * as React from "react";
import { GuestRoute } from "@/app/components/auth/GuestRoute";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <GuestRoute>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the system.
          </p>
        </div>
        <div className="border border-border bg-card p-6 shadow-sm">
          <React.Suspense fallback={null}>
            <LoginForm />
          </React.Suspense>
        </div>
      </div>
    </GuestRoute>
  );
}
