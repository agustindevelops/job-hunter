import { ensureAiConfig, generateAiObject } from "@/api/ai";
import {
  readApplicationTree,
  type ApplicationTree,
} from "@/api/application/_helpers";
import { ensureJobApplication } from "@/api/application/ensure";
import { upsertApplication } from "@/api/application/upsert";
import { db } from "@/db";
import {
  assembleTailoredApplication,
  assertSafeTailoredShape,
} from "./normalize";
import {
  ACHIEVEMENTS_SYSTEM_PROMPT,
  buildAchievementsPrompt,
  buildCoverLetterPrompt,
  buildEditorialRepairPrompt,
  buildExperienceEntityPrompt,
  buildProjectEntityPrompt,
  buildSkillsPrompt,
  COVER_LETTER_SYSTEM_PROMPT,
  ENTITY_SYSTEM_PROMPT,
  SKILLS_SYSTEM_PROMPT,
  type JobContext,
} from "./prompt";
import {
  tailoredAchievementsResponseSchema,
  tailoredCoverLetterResponseSchema,
  tailoredExperienceSchema,
  tailoredProjectSchema,
  tailoredSkillsResponseSchema,
  type TailoredExperience,
  type TailoredProject,
  type TailoredSkillsResponse,
} from "./schema";
import {
  serializeMasterForPrompt,
  type SerializedMasterApplication,
} from "./serialize";

export type MatchApplicationFromDumpInput = {
  jobId: number;
  /** Job posting dump — primary signal for what this role needs. */
  dataDump: string;
  /** Optional cleaned fields already matched onto the job row. */
  jobTitle?: string;
  jobBody?: string;
};

export {
  tailoredApplicationSchema,
  describeEditorialViolations,
  type TailoredApplicationResponse,
} from "./schema";
export {
  serializeMasterForPrompt,
  type SerializedMasterApplication,
} from "./serialize";
export {
  assembleTailoredApplication,
  normalizeTailoredApplication,
  assertSafeTailoredShape,
  copyEducationFromMaster,
} from "./normalize";
export {
  buildMatchPrompt,
  buildMatchUserPrompt,
  buildEditorialRepairPrompt,
  buildExperienceEntityPrompt,
  buildProjectEntityPrompt,
  buildSkillsPrompt,
  buildAchievementsPrompt,
  buildCoverLetterPrompt,
  ENTITY_SYSTEM_PROMPT,
  SKILLS_SYSTEM_PROMPT,
  ACHIEVEMENTS_SYSTEM_PROMPT,
  COVER_LETTER_SYSTEM_PROMPT,
  MATCH_SYSTEM_PROMPT,
} from "./prompt";

function repairBuilder() {
  return (original: string, error: unknown) => {
    const fromError =
      error instanceof Error
        ? error.message
            .replace(/^Structured output failed validation:\s*/i, "")
            .split(";")
            .map((part) => part.trim())
            .filter(Boolean)
        : [];
    return buildEditorialRepairPrompt(original, fromError);
  };
}

async function tailorExperience(input: {
  job: JobContext;
  experience: SerializedMasterApplication["experiences"][number];
  isPrimary: boolean;
}): Promise<TailoredExperience> {
  const prompt = buildExperienceEntityPrompt(input);
  const schema = tailoredExperienceSchema;

  if (/bidfta/i.test(input.experience.company)) {
    console.log("[matchApplicationFromDump] BIDFTA experience prompt", {
      company: input.experience.company,
      title: input.experience.title,
      isPrimary: input.isPrimary,
      system: ENTITY_SYSTEM_PROMPT,
      prompt,
      payload: input.experience,
    });
  }

  const result = await generateAiObject({
    schema,
    system: ENTITY_SYSTEM_PROMPT,
    prompt,
    repair: true,
    buildRepairPrompt: repairBuilder(),
  });

  if (/bidfta/i.test(input.experience.company)) {
    console.log("[matchApplicationFromDump] BIDFTA experience response", {
      summary: result.summary,
      bulletCount: result.bullets.length,
      bullets: result.bullets,
      payload: result,
    });
  }

  return result;
}

async function tailorProject(input: {
  job: JobContext;
  project: SerializedMasterApplication["projects"][number];
}): Promise<TailoredProject> {
  const prompt = buildProjectEntityPrompt(input);
  return generateAiObject({
    schema: tailoredProjectSchema,
    system: ENTITY_SYSTEM_PROMPT,
    prompt,
    repair: true,
    buildRepairPrompt: repairBuilder(),
  });
}

/**
 * Segmented match: concurrent per-experience and per-project calls, then
 * skills + achievements, then cover letter. Never mutates profile identity.
 * Failed generation never overwrites an existing valid tailored application.
 */
export async function matchApplicationFromDump(
  input: MatchApplicationFromDumpInput,
): Promise<ApplicationTree> {
  const dataDump = input.dataDump.trim();
  if (!dataDump) throw new Error("Data dump is required");

  const profile = await db.profiles.toCollection().first();
  if (!profile?.applicationId) {
    throw new Error("Profile master application not found");
  }

  const masterTree = await readApplicationTree(profile.applicationId);
  if (!masterTree) throw new Error("Failed to read master application");

  const job = await db.jobs.get(input.jobId);
  if (!job?.id) throw new Error(`Job ${input.jobId} not found`);

  const master = serializeMasterForPrompt(masterTree);
  const jobCtx: JobContext = {
    dataDump,
    jobTitle: input.jobTitle ?? job.jobTitle ?? "",
    jobBody: input.jobBody ?? job.body ?? "",
  };

  const config = await ensureAiConfig();
  console.log("[matchApplicationFromDump] model", {
    provider: config.provider,
    model: config.model,
    payload: { job: jobCtx, master },
  });

  let experiences: TailoredExperience[];
  let projects: TailoredProject[];
  let skillCategories: TailoredSkillsResponse["skillCategories"];
  let achievements: Array<{
    title: string | null;
    description: string;
    relatedTo: string | null;
    tags: string[];
  }>;
  let coverLetter: string;

  try {
    console.log("[matchApplicationFromDump] sending entity requests", {
      provider: config.provider,
      model: config.model,
      payload: {
        job: jobCtx,
        experiences: master.experiences,
        projects: master.projects,
      },
    });

    const [experienceResults, projectResults] = await Promise.all([
      Promise.all(
        master.experiences.map((experience, index) =>
          tailorExperience({
            job: jobCtx,
            experience,
            isPrimary: index === 0,
          }),
        ),
      ),
      Promise.all(
        master.projects.map((project) =>
          tailorProject({
            job: jobCtx,
            project,
          }),
        ),
      ),
    ]);

    experiences = experienceResults;
    projects = projectResults;

    console.log("[matchApplicationFromDump] sending skills + achievements", {
      provider: config.provider,
      model: config.model,
      payload: {
        job: jobCtx,
        tailoredExperiences: experiences,
        tailoredProjects: projects,
        masterSkills: master.skillCategories,
        masterAchievements: master.achievements,
      },
    });

    const [skillsResult, achievementsResult] = await Promise.all([
      generateAiObject({
        schema: tailoredSkillsResponseSchema,
        system: SKILLS_SYSTEM_PROMPT,
        prompt: buildSkillsPrompt({
          job: jobCtx,
          tailoredExperiences: experiences,
          tailoredProjects: projects,
          masterSkills: master.skillCategories,
        }),
        repair: true,
        buildRepairPrompt: repairBuilder(),
      }),
      generateAiObject({
        schema: tailoredAchievementsResponseSchema,
        system: ACHIEVEMENTS_SYSTEM_PROMPT,
        prompt: buildAchievementsPrompt({
          job: jobCtx,
          masterAchievements: master.achievements,
          tailoredExperiences: experiences,
          tailoredProjects: projects,
        }),
        repair: true,
        buildRepairPrompt: repairBuilder(),
      }),
    ]);

    skillCategories = skillsResult.skillCategories;
    achievements = achievementsResult.achievements;

    const assembledPreview = assembleTailoredApplication({
      master,
      experiences,
      projects,
      skillCategories,
      achievements,
      coverLetter: "",
    });

    const coverLetterPayload = {
      job: jobCtx,
      assembledApplication: {
        experiences,
        projects,
        skillCategories,
        achievements,
        education: assembledPreview.education,
      },
      master,
    };

    console.log("[matchApplicationFromDump] sending cover letter", {
      provider: config.provider,
      model: config.model,
      payload: coverLetterPayload,
    });

    const coverResult = await generateAiObject({
      schema: tailoredCoverLetterResponseSchema,
      system: COVER_LETTER_SYSTEM_PROMPT,
      prompt: buildCoverLetterPrompt(coverLetterPayload),
      repair: true,
      buildRepairPrompt: repairBuilder(),
    });

    coverLetter = coverResult.coverLetter;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate tailored application",
    );
  }

  const tailored = assembleTailoredApplication({
    master,
    experiences,
    projects,
    skillCategories,
    achievements,
    coverLetter,
  });
  assertSafeTailoredShape(master, tailored);

  const applicationId = await ensureJobApplication(input.jobId);
  await upsertApplication(applicationId, tailored);

  const tree = await readApplicationTree(applicationId);
  if (!tree) throw new Error("Failed to read tailored application");
  return tree;
}
