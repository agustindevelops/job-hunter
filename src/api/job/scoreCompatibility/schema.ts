import { z } from "zod";

const scoreField = z.number().int().min(1).max(5);

export const compatibilityScoreSchema = z.object({
  qualification: scoreField,
  qualificationReason: z.string().min(1),
  preference: scoreField,
  preferenceReason: z.string().min(1),
  compensation: scoreField,
  compensationReason: z.string().min(1),
});

export type CompatibilityScoreResponse = z.infer<
  typeof compatibilityScoreSchema
>;
