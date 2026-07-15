import { requireId } from "@/api/_requireId";
import { jobFromDump } from "@/api/job/fromDump";
import { db } from "@/db";
import type { Job } from "@/types/db";

type CreateJobFromApplyInput = {
  link: string;
  dataDump: string;
};

/**
 * Inserts a draft job from the Apply modal.
 * AI matches structured fields to the Job schema; the original dump is stored as-is.
 */
export async function createJobFromApply({
  link,
  dataDump,
}: CreateJobFromApplyInput): Promise<number> {
  const originalDump = dataDump.trim();
  if (!originalDump) throw new Error("Data dump is required");

  const enriched = await jobFromDump(originalDump);

  const contactId = requireId(await db.contacts.add({}), "contact");

  const row: Job = {
    contactId,
    applicationId: null,
    link: link.trim(),
    dataDump: originalDump,
    body: enriched.body,
    salaryMin: enriched.salaryMin,
    salaryMax: enriched.salaryMax,
    location: enriched.location,
    locationType: enriched.locationType,
    minYearsOfExperience: enriched.minYearsOfExperience,
    maxYearsOfExperience: enriched.maxYearsOfExperience,
    experienceLevel: enriched.experienceLevel,
    jobTitle: enriched.jobTitle,
  };

  const id = await db.jobs.add(row);
  if (id === undefined) {
    throw new Error("Failed to create job");
  }
  return id;
}
