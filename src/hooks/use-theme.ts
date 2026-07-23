"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

/**
 * Thin wrapper around next-themes that handles the hydration
 * mismatch by only resolving the theme after mount.
 */
export function useAppTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Only update state once to avoid cascading renders
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  return {
    theme,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    systemTheme,
    setTheme,
    isDark: mounted ? resolvedTheme === "dark" : false,
    isLight: mounted ? resolvedTheme === "light" : false,
    mounted,
  };
}
