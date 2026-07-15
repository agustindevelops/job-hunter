import { z } from "zod";
import {
  tailoredAchievementSchema,
  tailoredEducationSchema,
  tailoredExperienceSchema,
  tailoredFaqSchema,
  tailoredProjectSchema,
  tailoredSkillCategorySchema,
} from "@/api/application/matchFromDump/schema";

export const masterContactSchema = z.object({
  phone: z.string().nullable(),
  email: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipcode: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
});

/**
 * Complete master profile response from a dump.
 * Reuses resume-content schemas shared with job tailoring.
 */
export const masterProfileSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  summary: z.string(),
  contact: masterContactSchema,
  /** Master personal blurb (not a job-specific cover letter). */
  coverLetter: z.string(),
  targetRoles: z.array(z.string()),
  experiences: z.array(tailoredExperienceSchema),
  projects: z.array(tailoredProjectSchema),
  education: z.array(tailoredEducationSchema),
  skillCategories: z.array(tailoredSkillCategorySchema),
  achievements: z.array(tailoredAchievementSchema),
  faqs: z.array(tailoredFaqSchema),
});

export type MasterProfileResponse = z.infer<typeof masterProfileSchema>;
