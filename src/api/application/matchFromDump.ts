import { generateAiText } from "@/api/ai";
import {
  readApplicationTree,
  type ApplicationTree,
} from "@/api/application/_helpers";
import { ensureJobApplication } from "@/api/application/ensure";
import {
  upsertApplication,
  type UpsertApplicationInput,
} from "@/api/application/upsert";
import { db } from "@/db";
import { createLinkItem, createTextItem } from "@/lib/textItem";
import type { ProjectLink, TextItem } from "@/types/db";

export type MatchApplicationFromDumpInput = {
  jobId: number;
  /** Job posting dump — primary signal for what this role needs. */
  dataDump: string;
  /** Optional cleaned fields already matched onto the job row. */
  jobTitle?: string;
  jobBody?: string;
};

const RESPONSE_SHAPE = `{
  "coverLetter": string,
  "experiences": [{
    "company": string,
    "title": string,
    "location"?: string,
    "startDate": string,
    "endDate"?: string | null,
    "current"?: boolean,
    "summary"?: string,
    "bullets": string[],
    "technologies"?: string[],
    "tags"?: string[]
  }],
  "projects": [{
    "name": string,
    "type"?: string,
    "status"?: string,
    "summary"?: string,
    "bullets": string[],
    "technologies"?: string[],
    "links"?: [{ "label": string, "url": string }],
    "tags"?: string[]
  }],
  "education": [{
    "school": string,
    "location"?: string,
    "degree"?: string | null,
    "fieldOfStudy"?: string,
    "graduationDate"?: string | null,
    "coursework"?: string[],
    "bullets"?: string[],
    "tags"?: string[]
  }],
  "skillCategories": [{
    "category": string,
    "skills": string[],
    "tags"?: string[]
  }],
  "achievements": [{
    "title"?: string,
    "description": string,
    "relatedTo"?: string,
    "tags"?: string[]
  }],
  "faqs": [{
    "question": string,
    "answer": string
  }]
}`;

function textsOf(items: TextItem[] | undefined): string[] {
  return (items ?? []).map((item) => item.text).filter(Boolean);
}

function serializeMasterForPrompt(tree: ApplicationTree) {
  return {
    coverLetter: tree.coverLetter ?? "",
    experiences: tree.experiences.map(
      ({ id: _id, applicationId: _a, ...rest }) => ({
        ...rest,
        bullets: textsOf(rest.bullets),
        technologies: textsOf(rest.technologies),
      }),
    ),
    projects: tree.projects.map(({ id: _id, applicationId: _a, ...rest }) => ({
      ...rest,
      bullets: textsOf(rest.bullets),
      technologies: textsOf(rest.technologies),
      links: (rest.links ?? []).map(({ label, url }) => ({ label, url })),
    })),
    education: tree.education.map(({ id: _id, applicationId: _a, ...rest }) => ({
      ...rest,
      coursework: textsOf(rest.coursework),
      bullets: textsOf(rest.bullets),
    })),
    skillCategories: tree.skillCategories.map(
      ({ id: _id, applicationId: _a, ...rest }) => ({
        ...rest,
        skills: textsOf(rest.skills),
      }),
    ),
    achievements: tree.achievements.map(
      ({ id: _id, applicationId: _a, ...rest }) => rest,
    ),
    faqs: tree.faqs.map(({ id: _id, applicationId: _a, ...rest }) => rest),
  };
}

function buildPrompt(input: {
  dataDump: string;
  jobTitle: string;
  jobBody: string;
  master: ReturnType<typeof serializeMasterForPrompt>;
}): string {
  const masterJson = JSON.stringify(input.master, null, 2);
  const jobTitle = input.jobTitle.trim() || "(untitled)";
  const jobBody = input.jobBody.trim();

  return `You clone a MASTER resume into a job-specific application, then tailor it hard for THIS posting.

This is the core product value: one truthful master → a sharper, job-specific resume that a hiring manager can scan in 30 seconds and immediately see fit.

Return ONLY valid JSON matching this shape (no markdown fences, no commentary):
${RESPONSE_SHAPE}

## Mission
- Start from MASTER APPLICATION below. Clone its substance, then edit for this job.
- Truth first: never invent employers, titles, dates, degrees, projects, metrics, or technologies that are not supported by MASTER.
- Every change should strengthen candidacy for THIS role — not produce a generic rewrite.

## Tailoring rules (follow in order)
1. Relevance ranking — Inside each experience and project, reorder bullets so the strongest evidence for this posting comes first. Demote or drop bullets that do not help this role.
2. Remove repetition — Merge near-duplicate bullets (same achievement restated). Keep the single strongest wording; cut the rest.
3. Expand what is valuable — Lengthen and sharpen bullets that prove the posting's must-haves (stack, domain, scope, ownership, impact). Add concrete detail only when MASTER already supports it. Prefer action + scope + outcome.
4. Shorten what is not — Compress or cut bullets that are filler or off-target. Prefer fewer dense bullets over a long generic list.
5. Skills — Reorder categories and skills to mirror the posting's language where truthful. Promote matching skills; demote unrelated ones. Do not invent skills.
6. Summaries — Rewrite experience/project summaries toward this role's problem space, grounded only in MASTER facts.
7. Cover letter — Write a short, specific markdown pitch for THIS job (why them, why you, proof points). Ground every claim in MASTER. Use "" only if MASTER has nothing usable.
8. Structure — Keep real employers, projects, and schools. Prefer keep + shorten over deleting work history. You may omit a clearly irrelevant side project or weak achievement if dropping it improves focus.
9. Vocabulary — Where MASTER already has the skill/tool, prefer the posting's wording (e.g. "React" vs "React.js"). Never keyword-stuff lies.

## Constraints
- Dates, companies, titles, and schools must stay accurate.
- If MASTER lacks a requirement, do not claim it — emphasize adjacent strengths instead.
- Omit database ids; return a complete tailored application tree.
- Dates should be YYYY-MM when possible; use null for unknown end dates on current roles.

## JOB
Title: ${jobTitle}

Cleaned description (may be empty):
${jobBody || "(none)"}

Raw posting / data dump (primary signal — use this heavily):
${input.dataDump}

## MASTER APPLICATION
${masterJson}`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringOrNull(value: unknown): string | null {
  if (value == null) return null;
  return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && "text" in item) {
        return asString((item as { text: unknown }).text).trim();
      }
      return "";
    })
    .filter(Boolean);
}

function toTextItems(value: unknown): TextItem[] {
  return asStringArray(value).map((text) => createTextItem(text));
}

function toLinks(value: unknown): ProjectLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { label?: unknown; url?: unknown };
      const label = asString(row.label).trim();
      const url = asString(row.url).trim();
      if (!label && !url) return null;
      return createLinkItem(label, url);
    })
    .filter((link): link is ProjectLink => link != null);
}

function parseJsonObject(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain JSON");
  }
  const parsed = JSON.parse(jsonMatch[0]) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI response JSON must be an object");
  }
  return parsed as Record<string, unknown>;
}

function normalizeTailoredDump(
  raw: Record<string, unknown>,
): UpsertApplicationInput {
  const experiences = Array.isArray(raw.experiences) ? raw.experiences : [];
  const projects = Array.isArray(raw.projects) ? raw.projects : [];
  const education = Array.isArray(raw.education) ? raw.education : [];
  const skillCategories = Array.isArray(raw.skillCategories)
    ? raw.skillCategories
    : [];
  const achievements = Array.isArray(raw.achievements) ? raw.achievements : [];
  const faqs = Array.isArray(raw.faqs) ? raw.faqs : [];

  return {
    coverLetter: asString(raw.coverLetter),
    experiences: experiences
      .filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object",
      )
      .map((row) => ({
        company: asString(row.company).trim(),
        title: asString(row.title).trim(),
        location: asString(row.location).trim() || undefined,
        startDate: asString(row.startDate).trim(),
        endDate: asBoolean(row.current) ? null : asStringOrNull(row.endDate),
        current: asBoolean(row.current),
        summary: asString(row.summary).trim() || undefined,
        bullets: toTextItems(row.bullets),
        technologies: toTextItems(row.technologies),
        tags: asStringArray(row.tags),
      })),
    projects: projects
      .filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object",
      )
      .map((row) => ({
        name: asString(row.name).trim(),
        type: asString(row.type).trim() || undefined,
        status: asString(row.status).trim() || undefined,
        summary: asString(row.summary).trim() || undefined,
        bullets: toTextItems(row.bullets),
        technologies: toTextItems(row.technologies),
        links: toLinks(row.links),
        tags: asStringArray(row.tags),
      })),
    education: education
      .filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object",
      )
      .map((row) => ({
        school: asString(row.school).trim(),
        location: asString(row.location).trim() || undefined,
        degree: asStringOrNull(row.degree),
        fieldOfStudy: asString(row.fieldOfStudy).trim() || undefined,
        graduationDate: asStringOrNull(row.graduationDate),
        coursework: toTextItems(row.coursework),
        bullets: toTextItems(row.bullets),
        tags: asStringArray(row.tags),
      })),
    skillCategories: skillCategories
      .filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object",
      )
      .map((row) => ({
        category: asString(row.category).trim(),
        skills: toTextItems(row.skills),
        tags: asStringArray(row.tags),
      })),
    achievements: achievements
      .filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object",
      )
      .map((row) => ({
        title: asString(row.title).trim() || undefined,
        description: asString(row.description).trim(),
        relatedTo: asString(row.relatedTo).trim() || undefined,
        tags: asStringArray(row.tags),
      }))
      .filter((row) => row.description),
    faqs: faqs
      .filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object",
      )
      .map((row) => ({
        question: asString(row.question).trim(),
        answer: asString(row.answer),
      }))
      .filter((row) => row.question),
  };
}

/**
 * Clones the master application via AI and tailors it for this job's dump.
 * Writes the result into the job's tailored application (creating it if needed).
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

  const master = await readApplicationTree(profile.applicationId);
  if (!master) throw new Error("Failed to read master application");

  const job = await db.jobs.get(input.jobId);
  if (!job?.id) throw new Error(`Job ${input.jobId} not found`);

  const { text } = await generateAiText({
    prompt: buildPrompt({
      dataDump,
      jobTitle: input.jobTitle ?? job.jobTitle ?? "",
      jobBody: input.jobBody ?? job.body ?? "",
      master: serializeMasterForPrompt(master),
    }),
  });

  let tailored: UpsertApplicationInput;
  try {
    tailored = normalizeTailoredDump(parseJsonObject(text));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to parse AI tailored application: ${error.message}`
        : "Failed to parse AI tailored application",
    );
  }

  const applicationId = await ensureJobApplication(input.jobId);
  await upsertApplication(applicationId, tailored);

  const tree = await readApplicationTree(applicationId);
  if (!tree) throw new Error("Failed to read tailored application");
  return tree;
}
