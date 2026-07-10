import { requireId } from "@/api/_requireId";
import { db } from "@/db";

/** Gets or creates the tailored application for a job (status: applied). */
export async function ensureJobApplication(jobId: number): Promise<number> {
  const job = await db.jobs.get(jobId);
  if (!job?.id) throw new Error(`Job ${jobId} not found`);

  if (job.applicationId != null) {
    const existing = await db.applications.get(job.applicationId);
    if (existing?.id != null) return existing.id;
  }

  const applicationId = requireId(
    await db.applications.add({
      status: "applied",
      coverLetter: "",
    }),
    "application",
  );
  await db.jobs.update(jobId, { applicationId });
  return applicationId;
}
