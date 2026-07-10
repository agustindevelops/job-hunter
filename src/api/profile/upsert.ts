import { setEntityTags } from "@/api/application/_helpers";
import { requireId } from "@/api/_requireId";
import { db } from "@/db";
import type {
  AchievementRow,
  Contact,
  EducationRow,
  ExperienceRow,
  FaqRow,
  ProjectRow,
  SkillCategoryRow,
} from "@/types/db";

export type UpsertExperienceInput = Omit<
  ExperienceRow,
  "applicationId" | "id"
> & { id?: number; tags?: string[] };

export type UpsertProjectInput = Omit<ProjectRow, "applicationId" | "id"> & {
  id?: number;
  tags?: string[];
};

export type UpsertEducationInput = Omit<
  EducationRow,
  "applicationId" | "id"
> & { id?: number; tags?: string[] };

export type UpsertSkillCategoryInput = Omit<
  SkillCategoryRow,
  "applicationId" | "id"
> & { id?: number; tags?: string[] };

export type UpsertAchievementInput = Omit<
  AchievementRow,
  "applicationId" | "id"
> & { id?: number; tags?: string[] };

export type UpsertFaqInput = Omit<FaqRow, "applicationId" | "id"> & {
  id?: number;
};

export type UpsertProfileInput = {
  fullName: string;
  headline: string;
  summary: string;
  contact: Omit<Contact, "id">;
  /** Free-form markdown blurb on the master application */
  coverLetter?: string;
  targetRoles: string[];
  experiences: UpsertExperienceInput[];
  projects: UpsertProjectInput[];
  education: UpsertEducationInput[];
  skillCategories: UpsertSkillCategoryInput[];
  achievements: UpsertAchievementInput[];
  faqs: UpsertFaqInput[];
};

async function cascadeById<T extends { id?: number }>(opts: {
  existingIds: number[];
  payload: T[];
  deleteOne: (id: number) => Promise<void>;
  updateOne: (id: number, item: T) => Promise<void>;
  createOne: (item: T) => Promise<void>;
}): Promise<void> {
  const payloadIds = new Set(
    opts.payload.filter((p) => p.id != null).map((p) => p.id!),
  );

  for (const id of opts.existingIds) {
    if (!payloadIds.has(id)) {
      await opts.deleteOne(id);
    }
  }

  for (const item of opts.payload) {
    if (item.id != null && opts.existingIds.includes(item.id)) {
      await opts.updateOne(item.id, item);
    } else {
      await opts.createOne(item);
    }
  }
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
        });
        if (input.coverLetter !== undefined) {
          await db.applications.update(applicationId, {
            coverLetter: input.coverLetter,
          });
        }
      }

      // Target roles: replace all
      await db.targetRoles.where("profileId").equals(profileId).delete();
      for (const role of input.targetRoles) {
        const trimmed = role.trim();
        if (!trimmed) continue;
        await db.targetRoles.add({ profileId, role: trimmed });
      }

      // Experiences
      const existingExperiences = await db.experiences
        .where("applicationId")
        .equals(applicationId)
        .toArray();
      await cascadeById({
        existingIds: existingExperiences
          .map((e) => e.id)
          .filter((id): id is number => id != null),
        payload: input.experiences,
        deleteOne: async (id) => {
          await db.experienceTags.where("experienceId").equals(id).delete();
          await db.experiences.delete(id);
        },
        updateOne: async (id, item) => {
          const { id: _id, tags, ...rest } = item;
          await db.experiences.update(id, {
            ...rest,
            applicationId,
          });
          await setEntityTags(
            db.experienceTags,
            "experienceId",
            id,
            tags ?? [],
          );
        },
        createOne: async (item) => {
          const { id: _id, tags, ...rest } = item;
          const newId = requireId(
            await db.experiences.add({
              ...rest,
              applicationId,
            }),
            "experience",
          );
          await setEntityTags(
            db.experienceTags,
            "experienceId",
            newId,
            tags ?? [],
          );
        },
      });

      // Projects
      const existingProjects = await db.projects
        .where("applicationId")
        .equals(applicationId)
        .toArray();
      await cascadeById({
        existingIds: existingProjects
          .map((e) => e.id)
          .filter((id): id is number => id != null),
        payload: input.projects,
        deleteOne: async (id) => {
          await db.projectTags.where("projectId").equals(id).delete();
          await db.projects.delete(id);
        },
        updateOne: async (id, item) => {
          const { id: _id, tags, ...rest } = item;
          await db.projects.update(id, { ...rest, applicationId });
          await setEntityTags(db.projectTags, "projectId", id, tags ?? []);
        },
        createOne: async (item) => {
          const { id: _id, tags, ...rest } = item;
          const newId = requireId(
            await db.projects.add({ ...rest, applicationId }),
            "project",
          );
          await setEntityTags(db.projectTags, "projectId", newId, tags ?? []);
        },
      });

      // Education
      const existingEducation = await db.education
        .where("applicationId")
        .equals(applicationId)
        .toArray();
      await cascadeById({
        existingIds: existingEducation
          .map((e) => e.id)
          .filter((id): id is number => id != null),
        payload: input.education,
        deleteOne: async (id) => {
          await db.educationTags.where("educationId").equals(id).delete();
          await db.education.delete(id);
        },
        updateOne: async (id, item) => {
          const { id: _id, tags, ...rest } = item;
          await db.education.update(id, { ...rest, applicationId });
          await setEntityTags(db.educationTags, "educationId", id, tags ?? []);
        },
        createOne: async (item) => {
          const { id: _id, tags, ...rest } = item;
          const newId = requireId(
            await db.education.add({ ...rest, applicationId }),
            "education",
          );
          await setEntityTags(
            db.educationTags,
            "educationId",
            newId,
            tags ?? [],
          );
        },
      });

      // Skill categories
      const existingSkills = await db.skillCategories
        .where("applicationId")
        .equals(applicationId)
        .toArray();
      await cascadeById({
        existingIds: existingSkills
          .map((e) => e.id)
          .filter((id): id is number => id != null),
        payload: input.skillCategories,
        deleteOne: async (id) => {
          await db.skillCategoryTags
            .where("skillCategoryId")
            .equals(id)
            .delete();
          await db.skillCategories.delete(id);
        },
        updateOne: async (id, item) => {
          const { id: _id, tags, ...rest } = item;
          await db.skillCategories.update(id, { ...rest, applicationId });
          await setEntityTags(
            db.skillCategoryTags,
            "skillCategoryId",
            id,
            tags ?? [],
          );
        },
        createOne: async (item) => {
          const { id: _id, tags, ...rest } = item;
          const newId = requireId(
            await db.skillCategories.add({
              ...rest,
              applicationId,
            }),
            "skillCategory",
          );
          await setEntityTags(
            db.skillCategoryTags,
            "skillCategoryId",
            newId,
            tags ?? [],
          );
        },
      });

      // Achievements
      const existingAchievements = await db.achievements
        .where("applicationId")
        .equals(applicationId)
        .toArray();
      await cascadeById({
        existingIds: existingAchievements
          .map((e) => e.id)
          .filter((id): id is number => id != null),
        payload: input.achievements,
        deleteOne: async (id) => {
          await db.achievementTags.where("achievementId").equals(id).delete();
          await db.achievements.delete(id);
        },
        updateOne: async (id, item) => {
          const { id: _id, tags, ...rest } = item;
          await db.achievements.update(id, { ...rest, applicationId });
          await setEntityTags(
            db.achievementTags,
            "achievementId",
            id,
            tags ?? [],
          );
        },
        createOne: async (item) => {
          const { id: _id, tags, ...rest } = item;
          const newId = requireId(
            await db.achievements.add({ ...rest, applicationId }),
            "achievement",
          );
          await setEntityTags(
            db.achievementTags,
            "achievementId",
            newId,
            tags ?? [],
          );
        },
      });

      // FAQs
      const existingFaqs = await db.faqs
        .where("applicationId")
        .equals(applicationId)
        .toArray();
      await cascadeById({
        existingIds: existingFaqs
          .map((e) => e.id)
          .filter((id): id is number => id != null),
        payload: input.faqs,
        deleteOne: async (id) => {
          await db.faqs.delete(id);
        },
        updateOne: async (id, item) => {
          const { id: _id, ...rest } = item;
          await db.faqs.update(id, { ...rest, applicationId });
        },
        createOne: async (item) => {
          const { id: _id, ...rest } = item;
          await db.faqs.add({ ...rest, applicationId });
        },
      });

      return profileId;
    },
  );
}
