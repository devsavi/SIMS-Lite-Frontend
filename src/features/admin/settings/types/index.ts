export interface GeneralSettings {
  app_title: string;
  support_email: string | null;
  date_format: string;
}

export interface InventorySettings {
  default_low_stock_level: number;
}

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

export interface SystemSettingsConfig {
  id: string;
  general: GeneralSettings;
  inventory: InventorySettings;
  numbering: NumberingSettings;
  created_at: string;
  updated_at: string;
}

export interface UpdateSystemSettingsDTO {
  general?: Partial<GeneralSettings>;
  inventory?: Partial<InventorySettings>;
  numbering?: {
    po?: Partial<NumberingSequenceEntry>;
    grn?: Partial<NumberingSequenceEntry>;
    srn?: Partial<NumberingSequenceEntry>;
  };
}
