"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { companyApi } from "@/features/admin/company/api/company-api";
import { settingsApi } from "@/features/admin/settings/api/settings-api";
import { useSystemSettingsStore } from "@/stores/settings.store";

export function SystemSettingsSync() {
  const setSettings = useSystemSettingsStore((s) => s.setSettings);

  const { data: companyData } = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => companyApi.getCompanyProfile(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const { data: systemData } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => settingsApi.getSystemSettings(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  React.useEffect(() => {
    if (companyData) {
      setSettings({
        logoUrl: companyData.logo_url,
      });
    }
  }, [companyData, setSettings]);

  React.useEffect(() => {
    if (systemData) {
      const appTitle = systemData.general?.app_title || "SIMS Lite";
      setSettings({
        appTitle,
        dateFormat: systemData.general?.date_format || "YYYY-MM-DD",
      });
      if (typeof document !== "undefined") {
        document.title = appTitle;
      }
    }
  }, [systemData, setSettings]);

  return null;
}
