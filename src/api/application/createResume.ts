import {
  cloneApplicationContent,
  readApplicationTree,
  type ApplicationTree,
} from "@/api/application/_helpers";
import { ensureJobApplication } from "@/api/application/ensure";
import { db } from "@/db";

/**
 * Clones the master (profile) application content into the job's tailored application.
 * Creates the tailored application if missing. Does not copy coverLetter.
 */
export async function createResume(jobId: number): Promise<ApplicationTree> {
  const profile = await db.profiles.toCollection().first();
  if (!profile?.applicationId) {
    throw new Error("Profile master application not found");
  }

  const targetApplicationId = await ensureJobApplication(jobId);

  await db.transaction(
    "rw",
    [
      db.applications,
      db.jobs,
      db.profiles,
      db.experiences,
      db.projects,
      db.education,
      db.skillCategories,
      db.achievements,
      db.faqs,
      db.tags,
      db.experienceTags,
      db.projectTags,
      db.educationTags,
      db.skillCategoryTags,
      db.achievementTags,
    ],
    async () => {
      await cloneApplicationContent(
        profile.applicationId,
        targetApplicationId,
      );
    },
  );

  const tree = await readApplicationTree(targetApplicationId);
  if (!tree) throw new Error("Failed to read cloned application");
  return tree;
}
