export interface EmailConfig {
  id: string;
  sender_display_name: string;
  sender_email: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateEmailConfigDTO {
  sender_display_name?: string;
  sender_email?: string;
}
