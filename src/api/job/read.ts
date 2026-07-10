import { db } from "@/db";
import type {
  ApplicationRow,
  BenefitType,
  Contact,
  Job,
  Tag,
} from "@/types/db";

export type JobReadResult = {
  job: Job;
  contact: Contact | null;
  tags: Tag[];
  benefits: BenefitType[];
  application: Pick<
    ApplicationRow,
    "id" | "status" | "coverLetter"
  > | null;
};

/** Fetches a job with contact, tags, benefits, and application summary. */
export async function readJob(jobId: number): Promise<JobReadResult | null> {
  if (!Number.isFinite(jobId)) return null;

  const job = await db.jobs.get(jobId);
  if (!job?.id) return null;

  const contact =
    job.contactId > 0 ? ((await db.contacts.get(job.contactId)) ?? null) : null;

  const jobTagRows = await db.jobTags.where("jobId").equals(jobId).toArray();
  const tags = (
    await db.tags.bulkGet(jobTagRows.map((row) => row.tagId))
  ).filter((t): t is Tag => t != null);

  const jobBenefitRows = await db.jobBenefits
    .where("jobId")
    .equals(jobId)
    .toArray();
  const benefits = (
    await db.benefitTypes.bulkGet(
      jobBenefitRows.map((row) => row.benefitTypeId),
    )
  ).filter((b): b is BenefitType => b != null);

  let application: JobReadResult["application"] = null;
  if (job.applicationId != null) {
    const app = await db.applications.get(job.applicationId);
    if (app?.id != null) {
      application = {
        id: app.id,
        status: app.status,
        coverLetter: app.coverLetter,
      };
    }
  }

  return { job, contact, tags, benefits, application };
}
