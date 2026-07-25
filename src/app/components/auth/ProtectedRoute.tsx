"use client";

/**
 * ProtectedRoute — wraps authenticated pages.
 *
 * SessionProvider already gates rendering until hydration is complete,
 * so by the time this runs isAuthenticated is the ground truth.
 */

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  React.useEffect(() => {
    if (!isAuthenticated) {
      window.location.replace("/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
