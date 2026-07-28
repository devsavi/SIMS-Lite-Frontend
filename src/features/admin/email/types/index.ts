export type EncryptionType = "SSL" | "TLS" | "NONE";

export interface EmailConfig {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  encryptionType: EncryptionType;
  senderName: string;
  senderEmail: string;
  isPasswordSet: boolean;
  updatedAt: string;
}

export interface UpdateEmailConfigDTO {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  encryptionType: EncryptionType;
  senderName: string;
  senderEmail: string;
}

export interface TestConnectionDTO {
  recipientEmail: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  responseTimeMs?: number;
}
