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
  Theme,
} from "@/types/db";
import { BENEFIT_TYPES } from "./benefitTypes";
import { DEFAULT_THEME_COLOR, normalizeThemeColor } from "@/lib/themeColor";

class JobHunterDB extends Dexie {
  contacts!: EntityTable<Contact, "id">;
  profiles!: EntityTable<ProfileRow, "id">;
  applications!: EntityTable<ApplicationRow, "id">;
  themes!: EntityTable<Theme, "id">;
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

    this.version(4)
      .stores({
        contacts: "++id, email",
        profiles: "++id, contactId, applicationId",
        applications: "++id, status",
        themes: "++id, &profileId",
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
      })
      .upgrade(async (tx) => {
        const profiles = await tx.table("profiles").toArray();
        const themes = tx.table("themes");
        for (const profile of profiles) {
          const row = profile as { id?: number; themeColor?: string };
          if (row.id == null) continue;
          const existing = await themes
            .where("profileId")
            .equals(row.id)
            .first();
          if (existing) continue;
          await themes.add({
            profileId: row.id,
            primaryColor: normalizeThemeColor(
              row.themeColor ?? DEFAULT_THEME_COLOR,
            ),
          });
        }
      });

    // Restore original resume teal when the mistaken link-blue default was stored.
    this.version(5)
      .stores({
        contacts: "++id, email",
        profiles: "++id, contactId, applicationId",
        applications: "++id, status",
        themes: "++id, &profileId",
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
      })
      .upgrade(async (tx) => {
        const themes = tx.table("themes");
        const rows = await themes.toArray();
        for (const theme of rows) {
          if (
            theme.id != null &&
            normalizeThemeColor(theme.primaryColor) === "#0563C1"
          ) {
            await themes.update(theme.id, {
              primaryColor: DEFAULT_THEME_COLOR,
            });
          }
        }
      });

    // Employer/company name on job postings (PDF filenames, cover letter).
    this.version(6)
      .stores({
        contacts: "++id, email",
        profiles: "++id, contactId, applicationId",
        applications: "++id, status",
        themes: "++id, &profileId",
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
        jobs: "++id, contactId, applicationId, company, locationType, jobTitle, experienceLevel",
        jobTags: "++id, jobId, tagId, [jobId+tagId]",
        jobBenefits: "++id, jobId, benefitTypeId, [jobId+benefitTypeId]",
        profileBenefits:
          "++id, profileId, benefitTypeId, [profileId+benefitTypeId]",
      })
      .upgrade(async (tx) => {
        const jobs = tx.table("jobs");
        const rows = await jobs.toArray();
        for (const job of rows) {
          const row = job as { id?: number; company?: string };
          if (row.id == null) continue;
          if (typeof row.company === "string") continue;
          await jobs.update(row.id, { company: "" });
        }
      });
  }
}

export const db = new JobHunterDB();

db.on("populate", async (tx) => {
  await tx.table("benefitTypes").bulkAdd(
    BENEFIT_TYPES.map((b) => ({ name: b.name, label: b.label })),
  );
});
