import { db } from "@/db";
import type { Job, LocationType } from "@/types/db";

export type UpdateJobInput = {
  link: string;
  jobTitle: string;
  company: string;
  location: string;
  locationType: LocationType;
  salaryMin: number | null;
  salaryMax: number | null;
  minYearsOfExperience: string;
  maxYearsOfExperience: string;
  experienceLevel: string;
  body: string;
  dataDump: string;
};

/** Updates editable fields on an existing job. */
export async function updateJob(
  jobId: number,
  input: UpdateJobInput,
): Promise<void> {
  const job = await db.jobs.get(jobId);
  if (!job?.id) throw new Error(`Job ${jobId} not found`);

  const patch: Partial<Job> = {
    link: input.link.trim(),
    jobTitle: input.jobTitle.trim(),
    company: input.company.trim(),
    location: input.location.trim(),
    locationType: input.locationType,
    salaryMin: input.salaryMin,
    salaryMax: input.salaryMax,
    minYearsOfExperience: input.minYearsOfExperience.trim(),
    maxYearsOfExperience: input.maxYearsOfExperience.trim(),
    experienceLevel: input.experienceLevel.trim(),
    body: input.body,
    dataDump: input.dataDump,
  };

  await db.jobs.update(jobId, patch);
}
