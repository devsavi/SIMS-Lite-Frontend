// ---------------------------------------------------------------------------
// General Settings
// ---------------------------------------------------------------------------

export interface GeneralSettings {
  // Fields used by GeneralSettingsForm (snake_case from backend)
  app_title?: string;
  support_email?: string | null;
  date_format?: string;
  timezone?: string;

  // Extended fields used in tests / richer config (camelCase)
  siteName?: string;
  supportEmail?: string | null;
  sessionTimeoutMinutes?: number;
  timeZone?: string;
  dateFormat?: string;
  maintenanceMode?: boolean;
}

// ---------------------------------------------------------------------------
// Inventory Settings
// ---------------------------------------------------------------------------

export interface InventorySettings {
  // Field used by InventorySettingsForm (snake_case from backend)
  default_low_stock_level?: number;

  // Extended fields used in tests / richer config (camelCase)
  lowStockThresholdDefault?: number;
  enableStockReservation?: boolean;
  reservationExpiryHours?: number;
  allowNegativeStock?: boolean;
  autoBatchTracking?: boolean;
  barcodeFormat?: string;
}

// ---------------------------------------------------------------------------
// Procurement Settings
// ---------------------------------------------------------------------------

export interface ProcurementSettings {
  autoApprovePoLimit: number;
  requireGrnInspection: boolean;
  defaultPaymentTerms: string;
  allowOverReceivingPercentage: number;
  enableSupplierRatings: boolean;
}

// ---------------------------------------------------------------------------
// Notification Settings
// ---------------------------------------------------------------------------

export interface NotificationSettings {
  emailAlertsEnabled: boolean;
  stockLevelAlerts: boolean;
  poApprovalAlerts: boolean;
  securityAlerts: boolean;
  digestFrequency: "REALTIME" | "DAILY" | "WEEKLY";
}

// ---------------------------------------------------------------------------
// Report Settings
// ---------------------------------------------------------------------------

export interface ReportSettings {
  defaultExportFormat: "excel" | "csv" | "pdf";
  pageSize: "A4" | "LETTER";
  includeHeaderLogo: boolean;
  scheduledReportsEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Numbering Sequence
// ---------------------------------------------------------------------------

export interface NumberingSequenceEntry {
  prefix: string;
  suffix: string | null;
  next_sequence: number;
}

export interface NumberingSettings {
  po: NumberingSequenceEntry;
  grn: NumberingSequenceEntry;
  srn: NumberingSequenceEntry;
}

// ---------------------------------------------------------------------------
// Composite Config
// ---------------------------------------------------------------------------

export interface SystemSettingsConfig {
  // Core backend sections
  general: GeneralSettings;
  inventory: InventorySettings;
  numbering?: NumberingSettings;

  // Extended sections
  procurement: ProcurementSettings;
  notifications: NotificationSettings;
  reports: ReportSettings;

  // Timestamps
  id?: string;
  created_at?: string;
  updated_at?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type SettingsSection = "general" | "inventory" | "procurement" | "notifications" | "reports" | "numbering";

export type SectionData =
  | GeneralSettings
  | InventorySettings
  | ProcurementSettings
  | NotificationSettings
  | ReportSettings
  | NumberingSettings;

export interface UpdateSectionSettingsDTO {
  section: SettingsSection;
  data: SectionData;
}

export interface UpdateSystemSettingsDTO {
  general?: Partial<GeneralSettings>;
  inventory?: Partial<InventorySettings>;
  procurement?: Partial<ProcurementSettings>;
  notifications?: Partial<NotificationSettings>;
  reports?: Partial<ReportSettings>;
  numbering?: {
    po?: Partial<NumberingSequenceEntry>;
    grn?: Partial<NumberingSequenceEntry>;
    srn?: Partial<NumberingSequenceEntry>;
  };
}
