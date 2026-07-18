import { ensureAiConfig, generateAiObject } from "@/api/ai";
import { readApplicationTree } from "@/api/application/_helpers";
import { serializeMasterForPrompt } from "@/api/application/matchFromDump/serialize";
import { readJob } from "@/api/job/read";
import { db } from "@/db";
import type { PreferredLocationType } from "@/types/db";
import {
  buildCompatibilityPrompt,
  COMPATIBILITY_SYSTEM_PROMPT,
} from "./prompt";
import {
  compatibilityScoreSchema,
  type CompatibilityScoreResponse,
} from "./schema";

export type { CompatibilityScoreResponse } from "./schema";
export { compatibilityScoreSchema } from "./schema";

function averageScore(a: number, b: number, c: number): number {
  return Math.round(((a + b + c) / 3) * 10) / 10;
}

function asPreferredLocationType(value: unknown): PreferredLocationType {
  if (
    value === "remote" ||
    value === "hybrid" ||
    value === "on_site" ||
    value === "any"
  ) {
    return value;
  }
  return "any";
}

/**
 * Scores job compatibility (qualification / preference / compensation)
 * and persists the result on the job row.
 */
export async function scoreCompatibility(jobId: number): Promise<void> {
  await ensureAiConfig();

  const jobResult = await readJob(jobId);
  if (!jobResult) throw new Error(`Job ${jobId} not found`);

  const profile = await db.profiles.toCollection().first();
  if (!profile?.id || profile.applicationId == null) {
    throw new Error("Profile not found — set up your profile before scoring");
  }

  const tree = await readApplicationTree(profile.applicationId);
  if (!tree) throw new Error("Master application not found");

  const benefitLinks = await db.profileBenefits
    .where("profileId")
    .equals(profile.id)
    .toArray();
  const preferredBenefits = (
    await db.benefitTypes.bulkGet(
      benefitLinks.map((row) => row.benefitTypeId),
    )
  )
    .filter((b): b is NonNullable<typeof b> => b != null)
    .map((b) => b.label ?? b.name);

  const resume = {
    fullName: profile.fullName,
    headline: profile.headline,
    summary: profile.summary,
    targetRoles: (
      await db.targetRoles.where("profileId").equals(profile.id).toArray()
    ).map((r) => r.role),
    ...serializeMasterForPrompt(tree),
  };

  const preferences = {
    idealJobDescription: profile.idealJobDescription?.trim() || "",
    preferredLocationType: asPreferredLocationType(
      profile.preferredLocationType,
    ),
    salaryMinExpectation: profile.salaryMinExpectation ?? null,
    preferredBenefits,
  };

  const { job, benefits } = jobResult;
  const jobPayload = {
    jobTitle: job.jobTitle,
    location: job.location,
    locationType: job.locationType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    experienceLevel: job.experienceLevel,
    minYearsOfExperience: job.minYearsOfExperience,
    maxYearsOfExperience: job.maxYearsOfExperience,
    benefits: benefits.map((b) => b.label ?? b.name),
    body: job.body || job.dataDump,
  };

  const scored: CompatibilityScoreResponse = await generateAiObject({
    schema: compatibilityScoreSchema,
    system: COMPATIBILITY_SYSTEM_PROMPT,
    prompt: buildCompatibilityPrompt({
      resumeJson: JSON.stringify(resume, null, 2),
      preferencesJson: JSON.stringify(preferences, null, 2),
      jobJson: JSON.stringify(jobPayload, null, 2),
    }),
  });

  await db.jobs.update(jobId, {
    compatibilityQualification: scored.qualification,
    compatibilityQualificationReason: scored.qualificationReason.trim(),
    compatibilityPreference: scored.preference,
    compatibilityPreferenceReason: scored.preferenceReason.trim(),
    compatibilityCompensation: scored.compensation,
    compatibilityCompensationReason: scored.compensationReason.trim(),
    compatibilityScore: averageScore(
      scored.qualification,
      scored.preference,
      scored.compensation,
    ),
  });
}
