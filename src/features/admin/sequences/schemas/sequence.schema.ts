import { z } from "zod";

export const updateSequenceSchema = z.object({
  prefix: z.string().max(20, "Prefix cannot exceed 20 characters"),
  suffix: z.string().max(20, "Suffix cannot exceed 20 characters"),
  nextNumber: z.number().min(1, "Next number must be at least 1"),
  paddingDigits: z.number().min(1).max(10, "Padding must be between 1 and 10"),
  resetFrequency: z.enum(["NEVER", "YEARLY", "MONTHLY"]),
});

export type UpdateSequenceFormValues = z.infer<typeof updateSequenceSchema>;
