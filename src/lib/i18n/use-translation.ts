"use client";

import * as React from "react";
import { dictionary, type Dictionary } from "./dict";

export function useTranslation() {
  const t = React.useCallback(
    <K1 extends keyof Dictionary, K2 extends keyof Dictionary[K1]>(
      category: K1,
      key: K2
    ): string => {
      return (dictionary[category]?.[key] as unknown as string) ?? String(key);
    },
    []
  );

  return { t, dictionary };
}
