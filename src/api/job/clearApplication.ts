import { deleteApplicationCascade } from "@/api/application/_helpers";
import { db } from "@/db";

/** Removes the job's tailored application so the resume form is blank again. */
export async function clearJobApplication(jobId: number): Promise<void> {
  const job = await db.jobs.get(jobId);
  if (!job?.id) throw new Error(`Job ${jobId} not found`);
  if (job.applicationId == null) return;

  await db.transaction(
    "rw",
    [
      db.jobs,
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
      await deleteApplicationCascade(job.applicationId!);
      await db.jobs.update(jobId, { applicationId: null });
    },
  );
}
