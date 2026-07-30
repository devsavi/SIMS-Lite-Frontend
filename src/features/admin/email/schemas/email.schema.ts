import { z } from "zod";

export const emailConfigSchema = z.object({
  sender_display_name: z.string().min(2, "Sender display name is required"),
  sender_email: z.string().email("Valid sender email is required"),
});

export type EmailConfigFormValues = z.infer<typeof emailConfigSchema>;
