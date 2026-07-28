import { get, put } from "@/lib/api/client";
import type { NumberingSequence, UpdateSequenceDTO } from "../types";

const INITIAL_SEQUENCES: NumberingSequence[] = [
  {
    id: "seq-po",
    module: "PURCHASE_ORDER",
    title: "Purchase Orders",
    prefix: "PO-",
    suffix: "-2026",
    nextNumber: 42,
    paddingDigits: 5,
    resetFrequency: "YEARLY",
    updatedAt: "2026-07-28T10:00:00Z",
  },
  {
    id: "seq-grn",
    module: "GRN",
    title: "Goods Received Notes (GRN)",
    prefix: "GRN-",
    suffix: "",
    nextNumber: 108,
    paddingDigits: 6,
    resetFrequency: "NEVER",
    updatedAt: "2026-07-28T10:00:00Z",
  },
  {
    id: "seq-rel",
    module: "STOCK_RELEASE",
    title: "Stock Release Notes",
    prefix: "REL-",
    suffix: "",
    nextNumber: 73,
    paddingDigits: 5,
    resetFrequency: "MONTHLY",
    updatedAt: "2026-07-28T10:00:00Z",
  },
];

let localSequencesStore = [...INITIAL_SEQUENCES];

export const sequencesApi = {
  getSequences: async (): Promise<NumberingSequence[]> => {
    try {
      return await get<NumberingSequence[]>("/api/v1/admin/sequences");
    } catch {
      return localSequencesStore;
    }
  },

  updateSequence: async (id: string, payload: UpdateSequenceDTO): Promise<NumberingSequence> => {
    try {
      return await put<NumberingSequence>(`/api/v1/admin/sequences/${id}`, payload);
    } catch {
      localSequencesStore = localSequencesStore.map((s) =>
        s.id === id
          ? {
              ...s,
              ...payload,
              updatedAt: new Date().toISOString(),
            }
          : s
      );
      const updated = localSequencesStore.find((s) => s.id === id);
      if (!updated) throw new Error("Sequence not found");
      return updated;
    }
  },
};
