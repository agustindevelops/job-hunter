import Dexie, { type EntityTable } from "dexie";
import type {
  AchievementRow,
  AchievementTag,
  BenefitType,
  Contact,
  EducationRow,
  EducationTag,
  ExperienceRow,
  ExperienceTag,
  Job,
  JobBenefit,
  JobTag,
  ProfileRow,
  ProfileTag,
  ProjectRow,
  ProjectTag,
  SkillCategoryRow,
  SkillCategoryTag,
  Tag,
  TargetRole,
} from "@/types/db";
import { BENEFIT_TYPES } from "./benefitTypes";

class JobHunterDB extends Dexie {
  contacts!: EntityTable<Contact, "id">;
  profiles!: EntityTable<ProfileRow, "id">;
  targetRoles!: EntityTable<TargetRole, "id">;
  experiences!: EntityTable<ExperienceRow, "id">;
  projects!: EntityTable<ProjectRow, "id">;
  education!: EntityTable<EducationRow, "id">;
  skillCategories!: EntityTable<SkillCategoryRow, "id">;
  achievements!: EntityTable<AchievementRow, "id">;
  tags!: EntityTable<Tag, "id">;
  profileTags!: EntityTable<ProfileTag, "id">;
  experienceTags!: EntityTable<ExperienceTag, "id">;
  projectTags!: EntityTable<ProjectTag, "id">;
  educationTags!: EntityTable<EducationTag, "id">;
  skillCategoryTags!: EntityTable<SkillCategoryTag, "id">;
  achievementTags!: EntityTable<AchievementTag, "id">;
  benefitTypes!: EntityTable<BenefitType, "id">;
  jobs!: EntityTable<Job, "id">;
  jobTags!: EntityTable<JobTag, "id">;
  jobBenefits!: EntityTable<JobBenefit, "id">;

  constructor() {
    super("JobHunterDB");
    this.version(1).stores({
      contacts: "++id, email",
      profiles: "++id, contactId",
      targetRoles: "++id, profileId",
      experiences: "++id, profileId, company, startDate",
      projects: "++id, profileId, name",
      education: "++id, profileId, school",
      skillCategories: "++id, profileId, category",
      achievements: "++id, profileId",
      tags: "++id, &name",
      profileTags: "++id, profileId, tagId, [profileId+tagId]",
      experienceTags: "++id, experienceId, tagId, [experienceId+tagId]",
      projectTags: "++id, projectId, tagId, [projectId+tagId]",
      educationTags: "++id, educationId, tagId, [educationId+tagId]",
      skillCategoryTags:
        "++id, skillCategoryId, tagId, [skillCategoryId+tagId]",
      achievementTags: "++id, achievementId, tagId, [achievementId+tagId]",
      benefitTypes: "++id, &name",
      jobs: "++id, contactId, locationType, jobTitle, experienceLevel",
      jobTags: "++id, jobId, tagId, [jobId+tagId]",
      jobBenefits: "++id, jobId, benefitTypeId, [jobId+benefitTypeId]",
    });
  }
}

export const db = new JobHunterDB();

db.on("populate", async (tx) => {
  await tx.table("benefitTypes").bulkAdd(
    BENEFIT_TYPES.map((b) => ({ name: b.name, label: b.label })),
  );
});
