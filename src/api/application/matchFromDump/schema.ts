import { z } from "zod";

/** Link shape returned by the model (no database ids). */
export const tailoredProjectLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const tailoredExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  current: z.boolean(),
  summary: z.string().nullable(),
  bullets: z.array(z.string()),
  technologies: z.array(z.string()),
  tags: z.array(z.string()),
});

export const tailoredProjectSchema = z.object({
  name: z.string(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  summary: z.string().nullable(),
  bullets: z.array(z.string()),
  technologies: z.array(z.string()),
  links: z.array(tailoredProjectLinkSchema),
  tags: z.array(z.string()),
});

export const tailoredEducationSchema = z.object({
  school: z.string(),
  location: z.string().nullable(),
  degree: z.string().nullable(),
  fieldOfStudy: z.string().nullable(),
  graduationDate: z.string().nullable(),
  coursework: z.array(z.string()),
  bullets: z.array(z.string()),
  tags: z.array(z.string()),
});

export const tailoredSkillCategorySchema = z.object({
  category: z.string(),
  skills: z.array(z.string()),
  tags: z.array(z.string()),
});

export const tailoredAchievementSchema = z.object({
  title: z.string().nullable(),
  description: z.string(),
  relatedTo: z.string().nullable(),
  tags: z.array(z.string()),
});

export const tailoredFaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const tailoredSkillsResponseSchema = z.object({
  skillCategories: z.array(tailoredSkillCategorySchema),
});

export const tailoredAchievementsResponseSchema = z.object({
  achievements: z.array(tailoredAchievementSchema),
});

export const tailoredCoverLetterResponseSchema = z.object({
  coverLetter: z.string(),
});

/** Complete tailored application response (assembled from segmented calls). */
export const tailoredApplicationSchema = z.object({
  coverLetter: z.string(),
  experiences: z.array(tailoredExperienceSchema),
  projects: z.array(tailoredProjectSchema),
  education: z.array(tailoredEducationSchema),
  skillCategories: z.array(tailoredSkillCategorySchema),
  achievements: z.array(tailoredAchievementSchema),
  faqs: z.array(tailoredFaqSchema),
});

export type TailoredApplicationResponse = z.infer<
  typeof tailoredApplicationSchema
>;
export type TailoredExperience = z.infer<typeof tailoredExperienceSchema>;
export type TailoredProject = z.infer<typeof tailoredProjectSchema>;
export type TailoredSkillsResponse = z.infer<typeof tailoredSkillsResponseSchema>;
export type TailoredAchievementsResponse = z.infer<
  typeof tailoredAchievementsResponseSchema
>;
export type TailoredCoverLetterResponse = z.infer<
  typeof tailoredCoverLetterResponseSchema
>;

function describeZodIssues(
  schema: z.ZodType<unknown>,
  value: unknown,
): string[] {
  const parsed = schema.safeParse(value);
  if (parsed.success) return [];
  return parsed.error.issues.map((issue) => {
    const path = issue.path.join(".") || "(root)";
    return `${path}: ${issue.message}`;
  });
}

/** Human-readable list of schema shape violations for repair prompts. */
export function describeEditorialViolations(value: unknown): string[] {
  return describeZodIssues(tailoredApplicationSchema, value);
}

export function describeExperienceViolations(value: unknown): string[] {
  return describeZodIssues(tailoredExperienceSchema, value);
}

export function describeProjectViolations(value: unknown): string[] {
  return describeZodIssues(tailoredProjectSchema, value);
}
