"use client";

import { GuestRoute } from "@/app/components/auth/GuestRoute";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Create an account
          </h2>
          <p className="text-sm text-muted-foreground">
            Register to access the inventory management system.
          </p>
        </div>
        <div className="border border-border bg-card p-6 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </GuestRoute>
  );
}
