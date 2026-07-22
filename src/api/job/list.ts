import { db } from "@/db";
import type { ApplicationStatus, Job } from "@/types/db";

export type JobListItem = Job & {
  /** Tailored application status, or null when no application exists yet. */
  applicationStatus: ApplicationStatus | null;
};

/** Lists jobs newest-first for the Jobs Applied To table. */
export async function listJobs(): Promise<JobListItem[]> {
  const jobs = await db.jobs.orderBy("id").reverse().toArray();
  const applicationIds = [
    ...new Set(
      jobs
        .map((job) => job.applicationId)
        .filter((id): id is number => id != null),
    ),
  ];
  const applications = await db.applications.bulkGet(applicationIds);
  const statusById = new Map<number, ApplicationStatus>();
  for (const app of applications) {
    if (app?.id != null) statusById.set(app.id, app.status);
  }

  return jobs.map((job) => ({
    ...job,
    applicationStatus:
      job.applicationId != null
        ? (statusById.get(job.applicationId) ?? null)
        : null,
  }));
}
