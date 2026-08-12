export interface EmailConfig {
  id: string;
  // camelCase SMTP fields (primary shape used in tests and forms)
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpUsername?: string;
  senderName?: string;
  senderEmail?: string;
  isPasswordSet?: boolean;
  encryptionType?: "NONE" | "TLS" | "STARTTLS" | "SSL";
  updatedAt?: string;

  // snake_case fields from backend
  sender_display_name?: string;
  sender_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateEmailConfigDTO {
  // camelCase fields used in tests / forms
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpUsername?: string;
  senderName?: string;
  senderEmail?: string;
  encryptionType?: "NONE" | "TLS" | "STARTTLS" | "SSL";

  // snake_case fields from backend
  sender_display_name?: string;
  sender_email?: string;
}

export interface TestConnectionPayload {
  recipientEmail: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  latency_ms?: number;
  responseTimeMs?: number;
}
