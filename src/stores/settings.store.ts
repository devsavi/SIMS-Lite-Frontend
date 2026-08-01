import { create } from "zustand";

interface SystemSettingsState {
  appTitle: string;
  logoUrl: string | null;
  dateFormat: string;
  baseCurrency: string;
  setSettings: (updates: { appTitle?: string; logoUrl?: string | null; dateFormat?: string; baseCurrency?: string }) => void;
}

export const useSystemSettingsStore = create<SystemSettingsState>((set) => ({
  appTitle: "SIMS Lite",
  logoUrl: null,
  dateFormat: "YYYY-MM-DD",
  baseCurrency: "USD",
  setSettings: (updates) => set((state) => ({ ...state, ...updates })),
}));
