import { ensureJobApplication } from "@/api/application/ensure";
import { db } from "@/db";
import type { ApplicationStatus } from "@/types/db";

/** Job-facing application statuses (excludes master profile). Rejected last. */
export const JOB_APPLICATION_STATUSES = [
  "applied",
  "interviewed",
  "accepted",
  "rejected",
] as const satisfies readonly ApplicationStatus[];

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];

export function isJobApplicationStatus(
  value: string,
): value is JobApplicationStatus {
  return (JOB_APPLICATION_STATUSES as readonly string[]).includes(value);
}

/** Sets the tailored application status for a job (creates application if needed). */
export async function updateJobApplicationStatus(
  jobId: number,
  status: JobApplicationStatus,
): Promise<void> {
  const applicationId = await ensureJobApplication(jobId);
  await db.applications.update(applicationId, { status });
}
