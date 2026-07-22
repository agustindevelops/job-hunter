import { requireId } from "@/api/_requireId";
import { jobFromDump } from "@/api/job/fromDump";
import { syncJobBenefits } from "@/api/job/syncBenefits";
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
    company: enriched.company,
    appliedAt: Date.now(),
    compatibilityScore: null,
    compatibilityQualification: null,
    compatibilityQualificationReason: "",
    compatibilityPreference: null,
    compatibilityPreferenceReason: "",
    compatibilityCompensation: null,
    compatibilityCompensationReason: "",
  };

  return db.transaction(
    "rw",
    [db.jobs, db.jobBenefits, db.benefitTypes],
    async () => {
      const jobId = requireId(await db.jobs.add(row), "job");
      await syncJobBenefits(jobId, enriched.benefitNames);
      return jobId;
    },
  );
}
