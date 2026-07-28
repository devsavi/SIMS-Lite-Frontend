import { z } from "zod";

export const generalSettingsSchema = z.object({
  siteName: z.string().min(2, "Site name is required"),
  supportEmail: z.string().email("Valid email required"),
  sessionTimeoutMinutes: z.number().min(5).max(480),
  timeZone: z.string().min(1, "Timezone is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  maintenanceMode: z.boolean(),
});

export const inventorySettingsSchema = z.object({
  lowStockThresholdDefault: z.number().min(0),
  enableStockReservation: z.boolean(),
  reservationExpiryHours: z.number().min(1).max(168),
  allowNegativeStock: z.boolean(),
  autoBatchTracking: z.boolean(),
  barcodeFormat: z.enum(["CODE128", "EAN13", "QR"]),
});

export const procurementSettingsSchema = z.object({
  autoApprovePoLimit: z.number().min(0),
  requireGrnInspection: z.boolean(),
  defaultPaymentTerms: z.string().min(1),
  allowOverReceivingPercentage: z.number().min(0).max(50),
  enableSupplierRatings: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  emailAlertsEnabled: z.boolean(),
  stockLevelAlerts: z.boolean(),
  poApprovalAlerts: z.boolean(),
  securityAlerts: z.boolean(),
  digestFrequency: z.enum(["DAILY", "WEEKLY", "REALTIME"]),
});

export const reportSettingsSchema = z.object({
  defaultExportFormat: z.enum(["excel", "csv", "pdf"]),
  pageSize: z.enum(["A4", "LETTER"]),
  includeHeaderLogo: z.boolean(),
  scheduledReportsEnabled: z.boolean(),
});
