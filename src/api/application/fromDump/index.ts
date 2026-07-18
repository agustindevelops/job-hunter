import { generateAiObject } from "@/api/ai";
import type { UpsertProfileInput } from "@/api/profile";
import {
  assertSafeMasterShape,
  normalizeMasterProfile,
} from "./normalize";
import {
  buildMasterDumpUserPrompt,
  MASTER_DUMP_SYSTEM_PROMPT,
} from "./prompt";
import { masterProfileSchema } from "./schema";
import {
  emptySerializedProfile,
  serializeProfileForPrompt,
} from "./serialize";
import type { MasterFromDumpInput } from "./types";

export type { MasterFromDumpInput, MasterFromDumpMode } from "./types";
export { masterProfileSchema, type MasterProfileResponse } from "./schema";
export {
  serializeProfileForPrompt,
  emptySerializedProfile,
  type SerializedMasterProfile,
} from "./serialize";
export {
  normalizeMasterProfile,
  assertSafeMasterShape,
} from "./normalize";
export {
  buildMasterDumpPrompt,
  buildMasterDumpUserPrompt,
  MASTER_DUMP_SYSTEM_PROMPT,
} from "./prompt";

/**
 * Builds a master profile payload from a raw data dump via AI.
 * `add` merges with `current`; `replace` uses only the dump.
 * Validates structured output before returning — callers persist only on success.
 */
export async function masterFromDump(
  input: MasterFromDumpInput,
): Promise<UpsertProfileInput> {
  const dataDump = input.dataDump.trim();
  if (!dataDump) throw new Error("Data dump is required");

  const prior =
    input.mode === "add"
      ? input.current
        ? serializeProfileForPrompt(input.current)
        : emptySerializedProfile()
      : null;

  let raw;
  try {
    raw = await generateAiObject({
      schema: masterProfileSchema,
      system: MASTER_DUMP_SYSTEM_PROMPT,
      prompt: buildMasterDumpUserPrompt({
        mode: input.mode,
        dataDump,
        current: prior,
      }),
      repair: true,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate master profile from dump",
    );
  }

  const normalized = normalizeMasterProfile(raw);
  // Ideal-job preferences are profile settings, not resume dump content.
  if (input.current) {
    normalized.idealJobDescription = input.current.idealJobDescription;
    normalized.preferredLocationType = input.current.preferredLocationType;
    normalized.salaryMinExpectation = input.current.salaryMinExpectation;
    normalized.themeColor = input.current.themeColor;
    normalized.preferredBenefitNames = [
      ...input.current.preferredBenefitNames,
    ];
  }
  assertSafeMasterShape(input.mode, prior, normalized);
  return normalized;
}
