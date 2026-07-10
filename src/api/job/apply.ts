import type { AiConfig } from "@/types/ai";
import { requireId } from "@/api/_requireId";
import { createLanguageModel, generateText } from "@/lib/aiClient";
import { db } from "@/db";
import type { Job, LocationType } from "@/types/db";

type CreateJobFromApplyInput = {
  link: string;
  dataDump: string;
  /** Optional — when provided, attempts AI enrichment (may be incomplete). */
  aiConfig?: AiConfig | null;
};

/**
 * Stub for AI enrichment of a job dump.
 * Incomplete on purpose — apply still works without it.
 */
export async function enrichJobFromDump(
  dataDump: string,
  aiConfig: AiConfig,
): Promise<Partial<Job>> {
  const model = createLanguageModel(aiConfig);
  const { text } = await generateText({
    model,
    prompt: `Extract structured job fields as JSON with keys:
jobTitle, location, locationType (hybrid|remote|on_site|unknown),
salaryMin (number|null), salaryMax (number|null),
minYearsOfExperience, maxYearsOfExperience, experienceLevel, body.
Job posting text:
${dataDump}`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const locationType = parsed.locationType as LocationType | undefined;
    return {
      jobTitle: typeof parsed.jobTitle === "string" ? parsed.jobTitle : "",
      location: typeof parsed.location === "string" ? parsed.location : "",
      locationType:
        locationType === "hybrid" ||
        locationType === "remote" ||
        locationType === "on_site" ||
        locationType === "unknown"
          ? locationType
          : "unknown",
      salaryMin:
        typeof parsed.salaryMin === "number" ? parsed.salaryMin : null,
      salaryMax:
        typeof parsed.salaryMax === "number" ? parsed.salaryMax : null,
      minYearsOfExperience:
        typeof parsed.minYearsOfExperience === "string"
          ? parsed.minYearsOfExperience
          : "",
      maxYearsOfExperience:
        typeof parsed.maxYearsOfExperience === "string"
          ? parsed.maxYearsOfExperience
          : "",
      experienceLevel:
        typeof parsed.experienceLevel === "string"
          ? parsed.experienceLevel
          : "",
      body: typeof parsed.body === "string" ? parsed.body : "",
    };
  } catch {
    return {};
  }
}

/** Inserts a draft job from the Apply modal. Optionally enriches via AI. */
export async function createJobFromApply({
  link,
  dataDump,
  aiConfig,
}: CreateJobFromApplyInput): Promise<number> {
  let enriched: Partial<Job> = {};
  if (aiConfig) {
    try {
      enriched = await enrichJobFromDump(dataDump, aiConfig);
    } catch {
      // Apply must not fail if AI enrichment fails
      enriched = {};
    }
  }

  const contactId = requireId(await db.contacts.add({}), "contact");

  const row: Job = {
    contactId,
    applicationId: null,
    link: link.trim(),
    dataDump: dataDump.trim(),
    body: enriched.body ?? "",
    salaryMin: enriched.salaryMin ?? null,
    salaryMax: enriched.salaryMax ?? null,
    location: enriched.location ?? "",
    locationType: enriched.locationType ?? "unknown",
    minYearsOfExperience: enriched.minYearsOfExperience ?? "",
    maxYearsOfExperience: enriched.maxYearsOfExperience ?? "",
    experienceLevel: enriched.experienceLevel ?? "",
    jobTitle: enriched.jobTitle ?? "",
  };

  const id = await db.jobs.add(row);
  if (id === undefined) {
    throw new Error("Failed to create job");
  }
  return id;
}
