import { get, patch, post } from "@/lib/api/client";
import type {
  EmailConfig,
  TestConnectionPayload,
  TestConnectionResponse,
  UpdateEmailConfigDTO,
} from "../types";

interface EmailConfigResponse {
  status: string;
  data: EmailConfig;
}

interface TestConnectionApiResponse {
  status: string;
  data: TestConnectionResponse;
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

  testConnection: async (payload: TestConnectionPayload | string): Promise<TestConnectionResponse> => {
    const body = typeof payload === "string" ? { recipientEmail: payload } : payload;
    const response = await post<TestConnectionApiResponse>("/settings/email/test", body);
    return response.data;
  },
};
