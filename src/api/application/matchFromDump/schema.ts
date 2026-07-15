import { z } from "zod";

/** Editorial hard limits enforced by schema + prompt. */
export const EDITORIAL_LIMITS = {
  experienceSummaryMaxWords: 40,
  projectSummaryMaxWords: 35,
  bulletMaxWords: 45,
  experienceBulletsHardMax: 10,
  /** At most one experience may exceed this; others must stay at or below. */
  secondaryExperienceBulletsMax: 6,
  projectBulletsHardMax: 6,
  experienceTechnologiesMax: 12,
  projectTechnologiesMax: 10,
  educationBulletsMax: 4,
  skillCategorySkillsMax: 16,
} as const;

export function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function maxWords(max: number): (value: string | null) => boolean {
  return (value) => {
    if (value == null || value.trim() === "") return true;
    return wordCount(value) <= max;
  };
}

const experienceSummarySchema = z
  .string()
  .nullable()
  .refine(maxWords(EDITORIAL_LIMITS.experienceSummaryMaxWords), {
    message: `Experience summary must be at most ${EDITORIAL_LIMITS.experienceSummaryMaxWords} words`,
  });

const projectSummarySchema = z
  .string()
  .nullable()
  .refine(maxWords(EDITORIAL_LIMITS.projectSummaryMaxWords), {
    message: `Project summary must be at most ${EDITORIAL_LIMITS.projectSummaryMaxWords} words`,
  });

const bulletSchema = z.string().refine(maxWords(EDITORIAL_LIMITS.bulletMaxWords), {
  message: `Each bullet must be at most ${EDITORIAL_LIMITS.bulletMaxWords} words`,
});

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
  summary: experienceSummarySchema,
  bullets: z
    .array(bulletSchema)
    .max(
      EDITORIAL_LIMITS.experienceBulletsHardMax,
      `Experience bullets must be at most ${EDITORIAL_LIMITS.experienceBulletsHardMax}`,
    ),
  technologies: z
    .array(z.string())
    .max(
      EDITORIAL_LIMITS.experienceTechnologiesMax,
      `Experience technologies must be at most ${EDITORIAL_LIMITS.experienceTechnologiesMax}`,
    ),
  tags: z.array(z.string()),
});

export const tailoredProjectSchema = z.object({
  name: z.string(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  summary: projectSummarySchema,
  bullets: z
    .array(bulletSchema)
    .max(
      EDITORIAL_LIMITS.projectBulletsHardMax,
      `Project bullets must be at most ${EDITORIAL_LIMITS.projectBulletsHardMax}`,
    ),
  technologies: z
    .array(z.string())
    .max(
      EDITORIAL_LIMITS.projectTechnologiesMax,
      `Project technologies must be at most ${EDITORIAL_LIMITS.projectTechnologiesMax}`,
    ),
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
  bullets: z
    .array(bulletSchema)
    .max(
      EDITORIAL_LIMITS.educationBulletsMax,
      `Education bullets must be at most ${EDITORIAL_LIMITS.educationBulletsMax}`,
    ),
  tags: z.array(z.string()),
});

export const tailoredSkillCategorySchema = z.object({
  category: z.string(),
  skills: z
    .array(z.string())
    .max(
      EDITORIAL_LIMITS.skillCategorySkillsMax,
      `Skill category must be at most ${EDITORIAL_LIMITS.skillCategorySkillsMax} skills`,
    ),
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

const tailoredApplicationObjectSchema = z.object({
  coverLetter: z.string(),
  experiences: z.array(tailoredExperienceSchema),
  projects: z.array(tailoredProjectSchema),
  education: z.array(tailoredEducationSchema),
  skillCategories: z.array(tailoredSkillCategorySchema),
  achievements: z.array(tailoredAchievementSchema),
  faqs: z.array(tailoredFaqSchema),
});

/**
 * Complete tailored application response.
 * Used for generation, validation, and TypeScript inference.
 * Prefer `.nullable()` over `.optional()` for broader provider compatibility.
 *
 * Hard editorial ceilings are enforced here so oversized output cannot persist.
 */
export const tailoredApplicationSchema = tailoredApplicationObjectSchema.superRefine(
  (value, ctx) => {
    // At most one experience may use the higher bullet budget (most relevant/recent).
    const oversized = value.experiences
      .map((exp, index) => ({
        index,
        count: exp.bullets.length,
      }))
      .filter((row) => row.count > EDITORIAL_LIMITS.secondaryExperienceBulletsMax);

    if (oversized.length > 1) {
      for (const row of oversized.slice(1)) {
        ctx.addIssue({
          code: "custom",
          path: ["experiences", row.index, "bullets"],
          message: `Only one experience may exceed ${EDITORIAL_LIMITS.secondaryExperienceBulletsMax} bullets (most relevant/recent). This experience has ${row.count}; select, merge, and compress to ${EDITORIAL_LIMITS.secondaryExperienceBulletsMax} or fewer.`,
        });
      }
    }
  },
);

export type TailoredApplicationResponse = z.infer<
  typeof tailoredApplicationObjectSchema
>;

/** Human-readable list of editorial / schema violations for repair prompts. */
export function describeEditorialViolations(value: unknown): string[] {
  const parsed = tailoredApplicationSchema.safeParse(value);
  if (parsed.success) return [];
  return parsed.error.issues.map((issue) => {
    const path = issue.path.join(".") || "(root)";
    return `${path}: ${issue.message}`;
  });
}
