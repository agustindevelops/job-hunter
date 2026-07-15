import { generateAiObject } from "@/api/ai";
import {
  readApplicationTree,
  type ApplicationTree,
} from "@/api/application/_helpers";
import { ensureJobApplication } from "@/api/application/ensure";
import { upsertApplication } from "@/api/application/upsert";
import { db } from "@/db";
import {
  assertSafeTailoredShape,
  normalizeTailoredApplication,
} from "./normalize";
import {
  buildEditorialRepairPrompt,
  buildMatchUserPrompt,
  MATCH_SYSTEM_PROMPT,
} from "./prompt";
import {
  describeEditorialViolations,
  tailoredApplicationSchema,
} from "./schema";
import { serializeMasterForPrompt } from "./serialize";

export type MatchApplicationFromDumpInput = {
  jobId: number;
  /** Job posting dump — primary signal for what this role needs. */
  dataDump: string;
  /** Optional cleaned fields already matched onto the job row. */
  jobTitle?: string;
  jobBody?: string;
};

export {
  tailoredApplicationSchema,
  EDITORIAL_LIMITS,
  describeEditorialViolations,
  wordCount,
  type TailoredApplicationResponse,
} from "./schema";
export {
  serializeMasterForPrompt,
  type SerializedMasterApplication,
} from "./serialize";
export {
  normalizeTailoredApplication,
  assertSafeTailoredShape,
} from "./normalize";
export {
  buildMatchPrompt,
  buildMatchUserPrompt,
  buildEditorialRepairPrompt,
  MATCH_SYSTEM_PROMPT,
} from "./prompt";

/**
 * Clones the master application via AI and tailors it for this job's dump.
 * Validates structured output (including hard editorial ceilings) before any
 * write. Failed generation never overwrites an existing valid tailored application.
 */
export async function matchApplicationFromDump(
  input: MatchApplicationFromDumpInput,
): Promise<ApplicationTree> {
  const dataDump = input.dataDump.trim();
  if (!dataDump) throw new Error("Data dump is required");

  const profile = await db.profiles.toCollection().first();
  if (!profile?.applicationId) {
    throw new Error("Profile master application not found");
  }

  const master = await readApplicationTree(profile.applicationId);
  if (!master) throw new Error("Failed to read master application");

  const job = await db.jobs.get(input.jobId);
  if (!job?.id) throw new Error(`Job ${input.jobId} not found`);

  const serializedMaster = serializeMasterForPrompt(master);
  const jobTitle = input.jobTitle ?? job.jobTitle ?? "";
  const jobBody = input.jobBody ?? job.body ?? "";
  const userPrompt = buildMatchUserPrompt({
    dataDump,
    jobTitle,
    jobBody,
    master: serializedMaster,
  });

  // Generate + validate BEFORE ensure/upsert so failures cannot wipe content.
  let raw;
  try {
    raw = await generateAiObject({
      schema: tailoredApplicationSchema,
      system: MATCH_SYSTEM_PROMPT,
      prompt: userPrompt,
      repair: true,
      buildRepairPrompt: (original, error) => {
        const fromError =
          error instanceof Error
            ? error.message
                .replace(/^Structured output failed validation:\s*/i, "")
                .split(";")
                .map((part) => part.trim())
                .filter(Boolean)
            : [];
        const violations =
          fromError.length > 0 ? fromError : describeEditorialViolations(error);
        return buildEditorialRepairPrompt(original, violations);
      },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate tailored application",
    );
  }

  const tailored = normalizeTailoredApplication(raw, serializedMaster);
  assertSafeTailoredShape(serializedMaster, tailored);

  const applicationId = await ensureJobApplication(input.jobId);
  await upsertApplication(applicationId, tailored);

  const tree = await readApplicationTree(applicationId);
  if (!tree) throw new Error("Failed to read tailored application");
  return tree;
}
