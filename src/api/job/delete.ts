import { deleteApplicationCascade } from "@/api/application/_helpers";
import { db } from "@/db";

/** Removes a job, related tag/benefit rows, and its tailored application if any. */
export async function deleteJob(jobId: number): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.jobs,
      db.jobTags,
      db.jobBenefits,
      db.contacts,
      db.applications,
      db.experiences,
      db.projects,
      db.education,
      db.skillCategories,
      db.achievements,
      db.faqs,
      db.experienceTags,
      db.projectTags,
      db.educationTags,
      db.skillCategoryTags,
      db.achievementTags,
    ],
    async () => {
      const job = await db.jobs.get(jobId);
      if (!job) return;

      await db.jobTags.where("jobId").equals(jobId).delete();
      await db.jobBenefits.where("jobId").equals(jobId).delete();

      if (job.applicationId != null) {
        await deleteApplicationCascade(job.applicationId);
      }

      await db.jobs.delete(jobId);

      if (job.contactId) {
        await db.contacts.delete(job.contactId);
      }
    },
  );
}
