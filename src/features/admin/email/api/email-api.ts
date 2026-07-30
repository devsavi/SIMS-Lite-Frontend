import { get, patch } from "@/lib/api/client";
import type { EmailConfig, UpdateEmailConfigDTO } from "../types";

interface EmailConfigResponse {
  status: string;
  data: EmailConfig;
}

export const emailApi = {
  getEmailConfig: async (): Promise<EmailConfig> => {
    const response = await get<EmailConfigResponse>("/settings/email");
    return response.data;
  },

  updateEmailConfig: async (payload: UpdateEmailConfigDTO): Promise<EmailConfig> => {
    const response = await patch<EmailConfigResponse>("/settings/email", payload);
    return response.data;
  },
};
