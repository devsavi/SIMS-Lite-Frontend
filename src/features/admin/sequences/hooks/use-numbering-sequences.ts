import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sequencesApi } from "../api/sequences-api";
import type { UpdateSequenceDTO } from "../types";

export const sequenceKeys = {
  all: ["numbering-sequences"] as const,
};

export function useNumberingSequences() {
  return useQuery({
    queryKey: sequenceKeys.all,
    queryFn: () => sequencesApi.getSequences(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSequenceDTO }) =>
      sequencesApi.updateSequence(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sequenceKeys.all });
    },
  });
}
