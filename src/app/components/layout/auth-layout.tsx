/**
 * Authentication layout placeholder.
 * Full login / register page goes in Phase 1 (Auth).
 */
import * as React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* App branding */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "SIMS Lite"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enterprise Inventory Management
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
