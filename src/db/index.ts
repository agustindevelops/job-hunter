import Dexie, { type EntityTable } from "dexie";
import type {
  AchievementRow,
  AchievementTag,
  ApplicationRow,
  BenefitType,
  Contact,
  EducationRow,
  EducationTag,
  ExperienceRow,
  ExperienceTag,
  FaqRow,
  Job,
  JobBenefit,
  JobTag,
  ProfileBenefit,
  ProfileRow,
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
  applications!: EntityTable<ApplicationRow, "id">;
  targetRoles!: EntityTable<TargetRole, "id">;
  experiences!: EntityTable<ExperienceRow, "id">;
  projects!: EntityTable<ProjectRow, "id">;
  education!: EntityTable<EducationRow, "id">;
  skillCategories!: EntityTable<SkillCategoryRow, "id">;
  achievements!: EntityTable<AchievementRow, "id">;
  faqs!: EntityTable<FaqRow, "id">;
  tags!: EntityTable<Tag, "id">;
  experienceTags!: EntityTable<ExperienceTag, "id">;
  projectTags!: EntityTable<ProjectTag, "id">;
  educationTags!: EntityTable<EducationTag, "id">;
  skillCategoryTags!: EntityTable<SkillCategoryTag, "id">;
  achievementTags!: EntityTable<AchievementTag, "id">;
  benefitTypes!: EntityTable<BenefitType, "id">;
  jobs!: EntityTable<Job, "id">;
  jobTags!: EntityTable<JobTag, "id">;
  jobBenefits!: EntityTable<JobBenefit, "id">;
  profileBenefits!: EntityTable<ProfileBenefit, "id">;

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

    this.version(2)
      .stores({
        contacts: "++id, email",
        profiles: "++id, contactId, applicationId",
        applications: "++id, status",
        targetRoles: "++id, profileId",
        experiences: "++id, applicationId, company, startDate",
        projects: "++id, applicationId, name",
        education: "++id, applicationId, school",
        skillCategories: "++id, applicationId, category",
        achievements: "++id, applicationId",
        faqs: "++id, applicationId",
        tags: "++id, &name",
        profileTags: null,
        experienceTags: "++id, experienceId, tagId, [experienceId+tagId]",
        projectTags: "++id, projectId, tagId, [projectId+tagId]",
        educationTags: "++id, educationId, tagId, [educationId+tagId]",
        skillCategoryTags:
          "++id, skillCategoryId, tagId, [skillCategoryId+tagId]",
        achievementTags: "++id, achievementId, tagId, [achievementId+tagId]",
        benefitTypes: "++id, &name",
        jobs: "++id, contactId, applicationId, locationType, jobTitle, experienceLevel",
        jobTags: "++id, jobId, tagId, [jobId+tagId]",
        jobBenefits: "++id, jobId, benefitTypeId, [jobId+benefitTypeId]",
      })
      .upgrade(async (tx) => {
        await Promise.all([
          tx.table("experiences").clear(),
          tx.table("projects").clear(),
          tx.table("education").clear(),
          tx.table("skillCategories").clear(),
          tx.table("achievements").clear(),
          tx.table("experienceTags").clear(),
          tx.table("projectTags").clear(),
          tx.table("educationTags").clear(),
          tx.table("skillCategoryTags").clear(),
          tx.table("achievementTags").clear(),
          tx.table("targetRoles").clear(),
          tx.table("profiles").clear(),
          tx.table("contacts").clear(),
          tx.table("jobs").clear(),
          tx.table("jobTags").clear(),
          tx.table("jobBenefits").clear(),
        ]);

        const benefitTable = tx.table("benefitTypes");
        const count = await benefitTable.count();
        if (count === 0) {
          await benefitTable.bulkAdd(
            BENEFIT_TYPES.map((b) => ({ name: b.name, label: b.label })),
          );
        }
      });

    this.version(3).stores({
      contacts: "++id, email",
      profiles: "++id, contactId, applicationId",
      applications: "++id, status",
      targetRoles: "++id, profileId",
      experiences: "++id, applicationId, company, startDate",
      projects: "++id, applicationId, name",
      education: "++id, applicationId, school",
      skillCategories: "++id, applicationId, category",
      achievements: "++id, applicationId",
      faqs: "++id, applicationId",
      tags: "++id, &name",
      experienceTags: "++id, experienceId, tagId, [experienceId+tagId]",
      projectTags: "++id, projectId, tagId, [projectId+tagId]",
      educationTags: "++id, educationId, tagId, [educationId+tagId]",
      skillCategoryTags:
        "++id, skillCategoryId, tagId, [skillCategoryId+tagId]",
      achievementTags: "++id, achievementId, tagId, [achievementId+tagId]",
      benefitTypes: "++id, &name",
      jobs: "++id, contactId, applicationId, locationType, jobTitle, experienceLevel",
      jobTags: "++id, jobId, tagId, [jobId+tagId]",
      jobBenefits: "++id, jobId, benefitTypeId, [jobId+benefitTypeId]",
      profileBenefits:
        "++id, profileId, benefitTypeId, [profileId+benefitTypeId]",
    });
  }
}

export const db = new JobHunterDB();

db.on("populate", async (tx) => {
  await tx.table("benefitTypes").bulkAdd(
    BENEFIT_TYPES.map((b) => ({ name: b.name, label: b.label })),
  );
});
