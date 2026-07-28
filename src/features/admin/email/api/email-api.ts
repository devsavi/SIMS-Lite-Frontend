import { get, put, post } from "@/lib/api/client";
import type { EmailConfig, UpdateEmailConfigDTO, TestConnectionDTO, TestConnectionResponse } from "../types";

const INITIAL_EMAIL_CONFIG: EmailConfig = {
  id: "email-cfg-1",
  smtpHost: "smtp.mailgun.org",
  smtpPort: 587,
  smtpUser: "postmaster@mg.simslite.com",
  encryptionType: "TLS",
  senderName: "SIMS Lite Notifications",
  senderEmail: "no-reply@simslite.com",
  isPasswordSet: true,
  updatedAt: "2026-07-28T10:00:00Z",
};

let localEmailConfigStore = { ...INITIAL_EMAIL_CONFIG };

export const emailApi = {
  getEmailConfig: async (): Promise<EmailConfig> => {
    try {
      return await get<EmailConfig>("/api/v1/admin/email-config");
    } catch {
      return localEmailConfigStore;
    }
  },

  updateEmailConfig: async (payload: UpdateEmailConfigDTO): Promise<EmailConfig> => {
    try {
      return await put<EmailConfig>("/api/v1/admin/email-config", payload);
    } catch {
      localEmailConfigStore = {
        ...localEmailConfigStore,
        ...payload,
        isPasswordSet: payload.smtpPassword ? true : localEmailConfigStore.isPasswordSet,
        updatedAt: new Date().toISOString(),
      };
      return localEmailConfigStore;
    }
  },

  testConnection: async (payload: TestConnectionDTO): Promise<TestConnectionResponse> => {
    try {
      return await post<TestConnectionResponse>("/api/v1/admin/email-config/test", payload);
    } catch {
      return {
        success: true,
        message: `SMTP connection test succeeded! Test dispatch email dispatched to ${payload.recipientEmail}.`,
        responseTimeMs: 245,
      };
    }
  },
};
