import { get, put } from "@/lib/api/client";
import type { SystemSettingsConfig } from "../types";

const MOCK_SYSTEM_SETTINGS: SystemSettingsConfig = {
  general: {
    siteName: "SIMS Lite — Smart Inventory System",
    supportEmail: "support@simslite.io",
    sessionTimeoutMinutes: 60,
    timeZone: "UTC",
    dateFormat: "YYYY-MM-DD",
    maintenanceMode: false,
  },
  inventory: {
    lowStockThresholdDefault: 10,
    enableStockReservation: true,
    reservationExpiryHours: 48,
    allowNegativeStock: false,
    autoBatchTracking: true,
    barcodeFormat: "CODE128",
  },
  procurement: {
    autoApprovePoLimit: 500,
    requireGrnInspection: true,
    defaultPaymentTerms: "Net 30",
    allowOverReceivingPercentage: 5,
    enableSupplierRatings: true,
  },
  notifications: {
    emailAlertsEnabled: true,
    stockLevelAlerts: true,
    poApprovalAlerts: true,
    securityAlerts: true,
    digestFrequency: "REALTIME",
  },
  reports: {
    defaultExportFormat: "excel",
    pageSize: "A4",
    includeHeaderLogo: true,
    scheduledReportsEnabled: true,
  },
  updatedAt: "2026-07-28T12:00:00Z",
};

let localSettingsStore = { ...MOCK_SYSTEM_SETTINGS };

export const settingsApi = {
  getSystemSettings: async (): Promise<SystemSettingsConfig> => {
    try {
      return await get<SystemSettingsConfig>("/api/v1/admin/settings");
    } catch {
      return localSettingsStore;
    }
  },

  updateSectionSettings: async <K extends keyof Omit<SystemSettingsConfig, "updatedAt">>(
    section: K,
    data: SystemSettingsConfig[K]
  ): Promise<SystemSettingsConfig> => {
    try {
      return await put<SystemSettingsConfig>(`/api/v1/admin/settings/${section}`, data);
    } catch {
      localSettingsStore = {
        ...localSettingsStore,
        [section]: data,
        updatedAt: new Date().toISOString(),
      };
      return localSettingsStore;
    }
  },
};
