import { create } from "zustand";

interface PageTitleState {
  /** Dynamic title for the current page (e.g. a record name). Null = use route default. */
  dynamicTitle: string | null;
  setDynamicTitle: (title: string | null) => void;
}

export const usePageTitleStore = create<PageTitleState>()((set) => ({
  dynamicTitle: null,
  setDynamicTitle: (title) => set({ dynamicTitle: title }),
}));
