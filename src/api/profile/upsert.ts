import { requireId } from "@/api/_requireId";
import {
  syncApplicationContent,
  type UpsertApplicationInput,
  type UpsertAchievementInput,
  type UpsertEducationInput,
  type UpsertExperienceInput,
  type UpsertFaqInput,
  type UpsertProjectInput,
  type UpsertSkillCategoryInput,
} from "@/api/application/upsert";
import { db } from "@/db";
import type { Contact, PreferredLocationType } from "@/types/db";

export type {
  UpsertAchievementInput,
  UpsertEducationInput,
  UpsertExperienceInput,
  UpsertFaqInput,
  UpsertProjectInput,
  UpsertSkillCategoryInput,
};

export type UpsertProfileInput = {
  fullName: string;
  headline: string;
  summary: string;
  contact: Omit<Contact, "id">;
  /** Free-form markdown blurb on the master application */
  coverLetter?: string;
  targetRoles: string[];
  idealJobDescription: string;
  preferredLocationType: PreferredLocationType;
  salaryMinExpectation: number | null;
  /** Benefit type names from BENEFIT_TYPES / benefitTypes.name */
  preferredBenefitNames: string[];
  experiences: UpsertExperienceInput[];
  projects: UpsertProjectInput[];
  education: UpsertEducationInput[];
  skillCategories: UpsertSkillCategoryInput[];
  achievements: UpsertAchievementInput[];
  faqs: UpsertFaqInput[];
};

async function syncPreferredBenefits(
  profileId: number,
  benefitNames: string[],
): Promise<void> {
  await db.profileBenefits.where("profileId").equals(profileId).delete();
  const unique = [...new Set(benefitNames.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return;

  const types = await db.benefitTypes.where("name").anyOf(unique).toArray();
  const byName = new Map(types.map((t) => [t.name, t]));
  for (const name of unique) {
    const benefit = byName.get(name);
    if (!benefit?.id) continue;
    await db.profileBenefits.add({
      profileId,
      benefitTypeId: benefit.id,
    });
  }
}

/** Updates profile identity fields without touching the master application tree. */
export async function upsertProfileIdentity(input: {
  fullName: string;
  headline: string;
  summary: string;
  contact: Omit<Contact, "id">;
  targetRoles: string[];
}): Promise<void> {
  const profile = await db.profiles.toCollection().first();
  if (!profile?.id) throw new Error("Profile not found");

  await db.transaction(
    "rw",
    [db.contacts, db.profiles, db.targetRoles],
    async () => {
      await db.contacts.update(profile.contactId, { ...input.contact });
      await db.profiles.update(profile.id!, {
        fullName: input.fullName,
        headline: input.headline,
        summary: input.summary,
      });
      await db.targetRoles.where("profileId").equals(profile.id!).delete();
      for (const role of input.targetRoles) {
        const trimmed = role.trim();
        if (!trimmed) continue;
        await db.targetRoles.add({ profileId: profile.id!, role: trimmed });
      }
    },
  );
}

/** Create or update the single profile + master application tree. */
export async function upsertProfile(
  input: UpsertProfileInput,
): Promise<number> {
  return db.transaction(
    "rw",
    [
      db.contacts,
      db.profiles,
      db.applications,
      db.targetRoles,
      db.profileBenefits,
      db.benefitTypes,
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
      let profile = await db.profiles.toCollection().first();
      let contactId: number;
      let applicationId: number;
      let profileId: number;

      const preferenceFields = {
        idealJobDescription: input.idealJobDescription.trim(),
        preferredLocationType: input.preferredLocationType,
        salaryMinExpectation: input.salaryMinExpectation,
      };

      if (!profile?.id) {
        contactId = requireId(
          await db.contacts.add({ ...input.contact }),
          "contact",
        );
        applicationId = requireId(
          await db.applications.add({
            status: "master",
            coverLetter: input.coverLetter ?? "",
          }),
          "application",
        );
        profileId = requireId(
          await db.profiles.add({
            contactId,
            applicationId,
            fullName: input.fullName,
            headline: input.headline,
            summary: input.summary,
            ...preferenceFields,
          }),
          "profile",
        );
      } else {
        profileId = profile.id;
        contactId = profile.contactId;
        applicationId = profile.applicationId;

        await db.contacts.update(contactId, { ...input.contact });
        await db.profiles.update(profileId, {
          fullName: input.fullName,
          headline: input.headline,
          summary: input.summary,
          ...preferenceFields,
        });
      }

      await db.targetRoles.where("profileId").equals(profileId).delete();
      for (const role of input.targetRoles) {
        const trimmed = role.trim();
        if (!trimmed) continue;
        await db.targetRoles.add({ profileId, role: trimmed });
      }

      await syncPreferredBenefits(profileId, input.preferredBenefitNames);

      const content: UpsertApplicationInput = {
        coverLetter: input.coverLetter,
        experiences: input.experiences,
        projects: input.projects,
        education: input.education,
        skillCategories: input.skillCategories,
        achievements: input.achievements,
        faqs: input.faqs,
      };
      await syncApplicationContent(applicationId, content);

      return profileId;
    },
  );
}
