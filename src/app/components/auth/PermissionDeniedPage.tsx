"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export interface PermissionDeniedPageProps {
  title?: string;
  description?: string;
  requiredPermission?: string;
}

export function PermissionDeniedPage({
  title = "Access Denied",
  description = "You do not have the required permissions to access this page or resource.",
  requiredPermission,
}: PermissionDeniedPageProps) {
  return (
    <div
      role="alert"
      aria-label={title}
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center animate-fade-in"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-destructive/10 text-destructive shadow-xs">
        <ShieldAlert className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>

      {requiredPermission && (
        <code className="mt-3 rounded-none border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          Required permission: {requiredPermission}
        </code>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Go Back
        </Button>
        <Button asChild className="gap-2">
          <Link href="/dashboard">
            <Home className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
