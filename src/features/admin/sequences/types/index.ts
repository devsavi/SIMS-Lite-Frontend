export type DocumentModule = "PURCHASE_ORDER" | "GRN" | "STOCK_RELEASE";

export type ResetFrequency = "NEVER" | "YEARLY" | "MONTHLY";

export interface NumberingSequence {
  id: string;
  module: DocumentModule;
  title: string;
  prefix: string;
  suffix: string;
  nextNumber: number;
  paddingDigits: number;
  resetFrequency: ResetFrequency;
  lastResetAt?: string;
  updatedAt: string;
}

export interface UpdateSequenceDTO {
  prefix: string;
  suffix: string;
  nextNumber: number;
  paddingDigits: number;
  resetFrequency: ResetFrequency;
}
