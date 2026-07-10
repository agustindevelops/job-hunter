import { db } from "@/db";
import type { Job } from "@/types/db";

type CreateJobFromApplyInput = {
  link: string;
  dataDump: string;
};

/** Inserts a draft job from the Apply modal. AI enrichment fills the rest later. */
export async function createJobFromApply({
  link,
  dataDump,
}: CreateJobFromApplyInput): Promise<number> {
  const row: Job = {
    contactId: 0,
    link: link.trim(),
    dataDump: dataDump.trim(),
    body: "",
    salaryMin: null,
    salaryMax: null,
    location: "",
    locationType: "unknown",
    minYearsOfExperience: "",
    maxYearsOfExperience: "",
    experienceLevel: "",
    jobTitle: "",
  };

  const id = await db.jobs.add(row);
  if (id === undefined) {
    throw new Error("Failed to create job");
  }
  return id;
}

/** Removes a job and any related tag/benefit rows. */
export async function deleteJob(jobId: number): Promise<void> {
  await db.transaction(
    "rw",
    db.jobs,
    db.jobTags,
    db.jobBenefits,
    async () => {
      await db.jobTags.where("jobId").equals(jobId).delete();
      await db.jobBenefits.where("jobId").equals(jobId).delete();
      await db.jobs.delete(jobId);
    },
  );
}
