import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | SIMS Lite",
    default: "Sign In | SIMS Lite",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center bg-primary">
          <span className="text-lg font-bold text-primary-foreground">S</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {process.env.NEXT_PUBLIC_APP_NAME ?? "SIMS Lite"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Enterprise Inventory Management
        </p>
      </div>

      {/* Page content */}
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
