"use client";

/**
 * GuestRoute — wraps unauthenticated pages (login, register, etc.).
 *
 * SessionProvider already gates rendering until hydration is complete.
 * If the user is authenticated (e.g. after login), we keep rendering
 * children while the hard redirect fires — no blank screen.
 */

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.replace("/dashboard");
    }
  }, [isAuthenticated]);

  // Keep rendering children while redirect is in flight
  return <>{children}</>;
}
