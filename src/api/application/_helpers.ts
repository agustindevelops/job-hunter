import { requireId } from "@/api/_requireId";
import { db } from "@/db";
import type {
  AchievementRow,
  ApplicationStatus,
  EducationRow,
  ExperienceRow,
  FaqRow,
  ProjectRow,
  SkillCategoryRow,
  Tag,
} from "@/types/db";

export type Tagged<T> = T & { tags: string[] };

export type ApplicationTree = {
  id: number;
  status: ApplicationStatus;
  coverLetter: string;
  experiences: Tagged<ExperienceRow>[];
  projects: Tagged<ProjectRow>[];
  education: Tagged<EducationRow>[];
  skillCategories: Tagged<SkillCategoryRow>[];
  achievements: Tagged<AchievementRow>[];
  faqs: FaqRow[];
};

async function tagNamesFor(
  joinTable:
    | typeof db.experienceTags
    | typeof db.projectTags
    | typeof db.educationTags
    | typeof db.skillCategoryTags
    | typeof db.achievementTags,
  foreignKey: string,
  entityId: number,
): Promise<string[]> {
  const joins = await joinTable
    .where(foreignKey)
    .equals(entityId)
    .toArray();
  if (joins.length === 0) return [];
  const tags = await db.tags.bulkGet(joins.map((j) => j.tagId));
  return tags
    .filter((t): t is Tag => t != null)
    .map((t) => t.name);
}

export async function getOrCreateTagId(name: string): Promise<number> {
  const normalized = name.trim();
  if (!normalized) throw new Error("Tag name is required");
  const existing = await db.tags.where("name").equals(normalized).first();
  if (existing?.id != null) return existing.id;
  return requireId(await db.tags.add({ name: normalized }), "tag");
}

export async function setEntityTags(
  joinTable:
    | typeof db.experienceTags
    | typeof db.projectTags
    | typeof db.educationTags
    | typeof db.skillCategoryTags
    | typeof db.achievementTags,
  foreignKey: "experienceId" | "projectId" | "educationId" | "skillCategoryId" | "achievementId",
  entityId: number,
  tagNames: string[],
): Promise<void> {
  await joinTable.where(foreignKey).equals(entityId).delete();
  const unique = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))];
  for (const name of unique) {
    const tagId = await getOrCreateTagId(name);
    await joinTable.add({ [foreignKey]: entityId, tagId } as never);
  }
}

export async function readApplicationTree(
  applicationId: number,
): Promise<ApplicationTree | null> {
  const app = await db.applications.get(applicationId);
  if (!app?.id) return null;

  const [
    experiences,
    projects,
    education,
    skillCategories,
    achievements,
    faqs,
  ] = await Promise.all([
    db.experiences.where("applicationId").equals(applicationId).toArray(),
    db.projects.where("applicationId").equals(applicationId).toArray(),
    db.education.where("applicationId").equals(applicationId).toArray(),
    db.skillCategories.where("applicationId").equals(applicationId).toArray(),
    db.achievements.where("applicationId").equals(applicationId).toArray(),
    db.faqs.where("applicationId").equals(applicationId).toArray(),
  ]);

  return {
    id: app.id,
    status: app.status,
    coverLetter: app.coverLetter,
    experiences: await Promise.all(
      experiences.map(async (row) => ({
        ...row,
        tags: await tagNamesFor(db.experienceTags, "experienceId", row.id!),
      })),
    ),
    projects: await Promise.all(
      projects.map(async (row) => ({
        ...row,
        tags: await tagNamesFor(db.projectTags, "projectId", row.id!),
      })),
    ),
    education: await Promise.all(
      education.map(async (row) => ({
        ...row,
        tags: await tagNamesFor(db.educationTags, "educationId", row.id!),
      })),
    ),
    skillCategories: await Promise.all(
      skillCategories.map(async (row) => ({
        ...row,
        tags: await tagNamesFor(
          db.skillCategoryTags,
          "skillCategoryId",
          row.id!,
        ),
      })),
    ),
    achievements: await Promise.all(
      achievements.map(async (row) => ({
        ...row,
        tags: await tagNamesFor(db.achievementTags, "achievementId", row.id!),
      })),
    ),
    faqs,
  };
}

/** Deletes an application and all owned children + tag joins. */
export async function deleteApplicationCascade(
  applicationId: number,
): Promise<void> {
  const experiences = await db.experiences
    .where("applicationId")
    .equals(applicationId)
    .toArray();
  const projects = await db.projects
    .where("applicationId")
    .equals(applicationId)
    .toArray();
  const education = await db.education
    .where("applicationId")
    .equals(applicationId)
    .toArray();
  const skillCategories = await db.skillCategories
    .where("applicationId")
    .equals(applicationId)
    .toArray();
  const achievements = await db.achievements
    .where("applicationId")
    .equals(applicationId)
    .toArray();

  for (const row of experiences) {
    if (row.id != null) {
      await db.experienceTags.where("experienceId").equals(row.id).delete();
    }
  }
  for (const row of projects) {
    if (row.id != null) {
      await db.projectTags.where("projectId").equals(row.id).delete();
    }
  }
  for (const row of education) {
    if (row.id != null) {
      await db.educationTags.where("educationId").equals(row.id).delete();
    }
  }
  for (const row of skillCategories) {
    if (row.id != null) {
      await db.skillCategoryTags
        .where("skillCategoryId")
        .equals(row.id)
        .delete();
    }
  }
  for (const row of achievements) {
    if (row.id != null) {
      await db.achievementTags.where("achievementId").equals(row.id).delete();
    }
  }

  await db.experiences.where("applicationId").equals(applicationId).delete();
  await db.projects.where("applicationId").equals(applicationId).delete();
  await db.education.where("applicationId").equals(applicationId).delete();
  await db.skillCategories.where("applicationId").equals(applicationId).delete();
  await db.achievements.where("applicationId").equals(applicationId).delete();
  await db.faqs.where("applicationId").equals(applicationId).delete();
  await db.applications.delete(applicationId);
}

export async function cloneApplicationContent(
  sourceApplicationId: number,
  targetApplicationId: number,
): Promise<void> {
  const source = await readApplicationTree(sourceApplicationId);
  if (!source) throw new Error("Source application not found");

  // Clear existing tailored content before clone
  const existing = await readApplicationTree(targetApplicationId);
  if (existing) {
    for (const row of existing.experiences) {
      if (row.id != null) {
        await db.experienceTags.where("experienceId").equals(row.id).delete();
      }
    }
    for (const row of existing.projects) {
      if (row.id != null) {
        await db.projectTags.where("projectId").equals(row.id).delete();
      }
    }
    for (const row of existing.education) {
      if (row.id != null) {
        await db.educationTags.where("educationId").equals(row.id).delete();
      }
    }
    for (const row of existing.skillCategories) {
      if (row.id != null) {
        await db.skillCategoryTags
          .where("skillCategoryId")
          .equals(row.id)
          .delete();
      }
    }
    for (const row of existing.achievements) {
      if (row.id != null) {
        await db.achievementTags.where("achievementId").equals(row.id).delete();
      }
    }
    await db.experiences.where("applicationId").equals(targetApplicationId).delete();
    await db.projects.where("applicationId").equals(targetApplicationId).delete();
    await db.education.where("applicationId").equals(targetApplicationId).delete();
    await db.skillCategories
      .where("applicationId")
      .equals(targetApplicationId)
      .delete();
    await db.achievements
      .where("applicationId")
      .equals(targetApplicationId)
      .delete();
    await db.faqs.where("applicationId").equals(targetApplicationId).delete();
  }

  for (const row of source.experiences) {
    const { id: _id, tags, ...rest } = row;
    const newId = requireId(
      await db.experiences.add({
        ...rest,
        applicationId: targetApplicationId,
      }),
      "experience",
    );
    await setEntityTags(db.experienceTags, "experienceId", newId, tags);
  }

  for (const row of source.projects) {
    const { id: _id, tags, ...rest } = row;
    const newId = requireId(
      await db.projects.add({
        ...rest,
        applicationId: targetApplicationId,
      }),
      "project",
    );
    await setEntityTags(db.projectTags, "projectId", newId, tags);
  }

  for (const row of source.education) {
    const { id: _id, tags, ...rest } = row;
    const newId = requireId(
      await db.education.add({
        ...rest,
        applicationId: targetApplicationId,
      }),
      "education",
    );
    await setEntityTags(db.educationTags, "educationId", newId, tags);
  }

  for (const row of source.skillCategories) {
    const { id: _id, tags, ...rest } = row;
    const newId = requireId(
      await db.skillCategories.add({
        ...rest,
        applicationId: targetApplicationId,
      }),
      "skillCategory",
    );
    await setEntityTags(db.skillCategoryTags, "skillCategoryId", newId, tags);
  }

  for (const row of source.achievements) {
    const { id: _id, tags, ...rest } = row;
    const newId = requireId(
      await db.achievements.add({
        ...rest,
        applicationId: targetApplicationId,
      }),
      "achievement",
    );
    await setEntityTags(db.achievementTags, "achievementId", newId, tags);
  }

  for (const row of source.faqs) {
    const { id: _id, ...rest } = row;
    await db.faqs.add({
      ...rest,
      applicationId: targetApplicationId,
    });
  }
}
