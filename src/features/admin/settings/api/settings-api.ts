import { get, patch } from "@/lib/api/client";
import type { SystemSettingsConfig, UpdateSystemSettingsDTO } from "../types";

interface SystemSettingsResponse {
  status: string;
  data: SystemSettingsConfig;
}

export const settingsApi = {
  getSystemSettings: async (): Promise<SystemSettingsConfig> => {
    const response = await get<SystemSettingsResponse>("/settings/system");
    return response.data;
  },

  updateSystemSettings: async (payload: UpdateSystemSettingsDTO): Promise<SystemSettingsConfig> => {
    const response = await patch<SystemSettingsResponse>("/settings/system", payload);
    return response.data;
  },
};
