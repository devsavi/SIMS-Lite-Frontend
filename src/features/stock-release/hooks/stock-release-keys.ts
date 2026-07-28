import type { StockReleaseFilterParams } from "../types/stock-release-types";

export const stockReleaseKeys = {
  all: ["stock-releases"] as const,
  lists: () => [...stockReleaseKeys.all, "list"] as const,
  list: (params?: StockReleaseFilterParams) =>
    [...stockReleaseKeys.lists(), params] as const,
  details: () => [...stockReleaseKeys.all, "detail"] as const,
  detail: (id: string) => [...stockReleaseKeys.details(), id] as const,
};
