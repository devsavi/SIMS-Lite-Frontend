"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary — catches unhandled errors at the layout level.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  React.useEffect(() => {
    // Log to error reporting service in production
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive/70" />
      <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. You can try again or contact support if the
        problem persists.
      </p>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mt-4 max-w-lg overflow-auto rounded border border-destructive/20 bg-destructive/5 p-3 text-left text-xs text-destructive">
          {error.message}
        </pre>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
