import {
  readApplicationTree,
  type ApplicationTree,
} from "@/api/application/_helpers";
import { db } from "@/db";
import { DEFAULT_THEME_COLOR, normalizeThemeColor } from "@/lib/themeColor";
import type { Contact, Job, ProfileRow, TargetRole, Theme } from "@/types/db";

export type JobResumeResult = {
  job: Job;
  profile: ProfileRow;
  contact: Contact;
  targetRoles: TargetRole[];
  theme: Theme;
  /** Null when no tailored application exists yet — form should stay blank. */
  application: ApplicationTree | null;
};

/**
 * Loads profile identity + the job's tailored application tree when present.
 * Does not create or clone a resume — blank until the user builds one.
 */
export async function readJobResume(
  jobId: number,
): Promise<JobResumeResult | null> {
  if (!Number.isFinite(jobId)) return null;

  const job = await db.jobs.get(jobId);
  if (!job?.id) return null;

  const profile = await db.profiles.toCollection().first();
  if (!profile?.id || profile.applicationId == null) {
    throw new Error("Create a profile before editing a job resume");
  }

  const contact = await db.contacts.get(profile.contactId);
  if (!contact) throw new Error("Profile contact not found");

  let application: ApplicationTree | null = null;
  if (job.applicationId != null) {
    application = await readApplicationTree(job.applicationId);
  }

  const targetRoles = await db.targetRoles
    .where("profileId")
    .equals(profile.id)
    .toArray();

  let theme = await db.themes.where("profileId").equals(profile.id).first();
  if (!theme) {
    const id = await db.themes.add({
      profileId: profile.id,
      primaryColor: DEFAULT_THEME_COLOR,
    });
    theme = {
      id,
      profileId: profile.id,
      primaryColor: DEFAULT_THEME_COLOR,
    };
  } else {
    theme = {
      ...theme,
      primaryColor: normalizeThemeColor(theme.primaryColor),
    };
  }

  return {
    job,
    profile,
    contact,
    targetRoles,
    theme,
    application,
  };
}
