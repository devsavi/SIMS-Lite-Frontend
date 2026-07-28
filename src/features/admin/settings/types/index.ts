export interface GeneralSettings {
  siteName: string;
  supportEmail: string;
  sessionTimeoutMinutes: number;
  timeZone: string;
  dateFormat: string;
  maintenanceMode: boolean;
}

export interface InventorySettings {
  lowStockThresholdDefault: number;
  enableStockReservation: boolean;
  reservationExpiryHours: number;
  allowNegativeStock: boolean;
  autoBatchTracking: boolean;
  barcodeFormat: "CODE128" | "EAN13" | "QR";
}

export interface ProcurementSettings {
  autoApprovePoLimit: number;
  requireGrnInspection: boolean;
  defaultPaymentTerms: string;
  allowOverReceivingPercentage: number;
  enableSupplierRatings: boolean;
}

export interface NotificationSettings {
  emailAlertsEnabled: boolean;
  stockLevelAlerts: boolean;
  poApprovalAlerts: boolean;
  securityAlerts: boolean;
  digestFrequency: "DAILY" | "WEEKLY" | "REALTIME";
}

export interface ReportSettings {
  defaultExportFormat: "excel" | "csv" | "pdf";
  pageSize: "A4" | "LETTER";
  includeHeaderLogo: boolean;
  scheduledReportsEnabled: boolean;
}

export interface SystemSettingsConfig {
  general: GeneralSettings;
  inventory: InventorySettings;
  procurement: ProcurementSettings;
  notifications: NotificationSettings;
  reports: ReportSettings;
  updatedAt: string;
}
