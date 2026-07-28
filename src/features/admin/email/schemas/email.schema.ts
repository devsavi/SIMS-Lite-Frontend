import { z } from "zod";

export const emailConfigSchema = z.object({
  smtpHost: z.string().min(2, "SMTP Host is required"),
  smtpPort: z.number().min(1).max(65535, "Port must be between 1 and 65535"),
  smtpUser: z.string().min(1, "SMTP Username is required"),
  smtpPassword: z.string().optional(),
  encryptionType: z.enum(["SSL", "TLS", "NONE"]),
  senderName: z.string().min(2, "Sender Name is required"),
  senderEmail: z.string().email("Valid Sender Email is required"),
});

export const testConnectionSchema = z.object({
  recipientEmail: z.string().email("Valid recipient email is required"),
});

export type EmailConfigFormValues = z.infer<typeof emailConfigSchema>;
export type TestConnectionFormValues = z.infer<typeof testConnectionSchema>;
