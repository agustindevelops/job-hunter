import { generateAiText } from "@/api/ai";
import type { UpsertProfileInput } from "@/api/profile";
import { createLinkItem, createTextItem } from "@/lib/textItem";
import type { ProjectLink, TextItem } from "@/types/db";

export type MasterFromDumpMode = "add" | "replace";

export type MasterFromDumpInput = {
  mode: MasterFromDumpMode;
  dataDump: string;
  /**
   * Current master profile. Used for `add` so the model can merge.
   * Ignored for `replace`.
   */
  current?: UpsertProfileInput | null;
};

const RESPONSE_SHAPE = `{
  "fullName": string,
  "headline": string,
  "summary": string,
  "contact": {
    "phone"?: string,
    "email"?: string,
    "city"?: string,
    "state"?: string,
    "zipcode"?: string,
    "portfolioUrl"?: string,
    "linkedinUrl"?: string,
    "githubUrl"?: string
  },
  "coverLetter": string,
  "targetRoles": string[],
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

function buildPrompt(input: MasterFromDumpInput): string {
  const dump = input.dataDump.trim();

  if (input.mode === "replace") {
    return `You extract structured resume/profile data from a raw text dump (LinkedIn export, resume paste, notes, etc.).

Return ONLY valid JSON matching this shape (no markdown fences, no commentary):
${RESPONSE_SHAPE}

Rules:
- Use only information present in the dump. Do not invent employers, degrees, or skills.
- Dates should be YYYY-MM when possible; use null for unknown end dates on current roles.
- Prefer concise bullet points; keep technologies and tags as short strings.
- coverLetter may be a short personal blurb in markdown, or "" if unknown.
- Leave arrays empty when the dump has nothing for that section.

Data dump:
${dump}`;
  }

  const currentJson = JSON.stringify(
    serializeForPrompt(input.current ?? emptyCurrent()),
    null,
    2,
  );

  return `You merge a raw text dump into an existing master resume/profile.

Return ONLY valid JSON matching this shape (no markdown fences, no commentary):
${RESPONSE_SHAPE}

Rules:
- Start from CURRENT MASTER below, then incorporate the dump.
- Keep existing entries unless the dump clearly corrects them.
- Add new experiences, projects, education, skills, achievements, and FAQs from the dump.
- Enrich existing entries when the dump has more detail (bullets, tech, dates).
- Do not invent employers, degrees, or skills that appear in neither source.
- Dates should be YYYY-MM when possible; use null for unknown end dates on current roles.
- coverLetter may be a short personal blurb in markdown.
- Omit database ids; return a complete merged profile.

CURRENT MASTER:
${currentJson}

Data dump:
${dump}`;
}

function emptyCurrent(): UpsertProfileInput {
  return {
    fullName: "",
    headline: "",
    summary: "",
    contact: {},
    coverLetter: "",
    targetRoles: [],
    experiences: [],
    projects: [],
    education: [],
    skillCategories: [],
    achievements: [],
    faqs: [],
  };
}

/** Strip TextItem ids for a smaller, AI-friendly prompt payload. */
function serializeForPrompt(input: UpsertProfileInput) {
  return {
    fullName: input.fullName,
    headline: input.headline,
    summary: input.summary,
    contact: input.contact,
    coverLetter: input.coverLetter ?? "",
    targetRoles: input.targetRoles,
    experiences: input.experiences.map(({ id: _id, ...rest }) => ({
      ...rest,
      bullets: textsOf(rest.bullets),
      technologies: textsOf(rest.technologies),
    })),
    projects: input.projects.map(({ id: _id, ...rest }) => ({
      ...rest,
      bullets: textsOf(rest.bullets),
      technologies: textsOf(rest.technologies),
      links: (rest.links ?? []).map(({ label, url }) => ({ label, url })),
    })),
    education: input.education.map(({ id: _id, ...rest }) => ({
      ...rest,
      coursework: textsOf(rest.coursework),
      bullets: textsOf(rest.bullets),
    })),
    skillCategories: input.skillCategories.map(({ id: _id, ...rest }) => ({
      ...rest,
      skills: textsOf(rest.skills),
    })),
    achievements: input.achievements.map(({ id: _id, ...rest }) => rest),
    faqs: input.faqs.map(({ id: _id, ...rest }) => rest),
  };
}

function textsOf(items: TextItem[] | undefined): string[] {
  return (items ?? []).map((item) => item.text).filter(Boolean);
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

function normalizeMasterDump(raw: Record<string, unknown>): UpsertProfileInput {
  const contactRaw =
    raw.contact && typeof raw.contact === "object" && !Array.isArray(raw.contact)
      ? (raw.contact as Record<string, unknown>)
      : {};

  const experiences = Array.isArray(raw.experiences) ? raw.experiences : [];
  const projects = Array.isArray(raw.projects) ? raw.projects : [];
  const education = Array.isArray(raw.education) ? raw.education : [];
  const skillCategories = Array.isArray(raw.skillCategories)
    ? raw.skillCategories
    : [];
  const achievements = Array.isArray(raw.achievements) ? raw.achievements : [];
  const faqs = Array.isArray(raw.faqs) ? raw.faqs : [];

  return {
    fullName: asString(raw.fullName).trim(),
    headline: asString(raw.headline).trim(),
    summary: asString(raw.summary).trim(),
    contact: {
      phone: asString(contactRaw.phone).trim() || undefined,
      email: asString(contactRaw.email).trim() || undefined,
      city: asString(contactRaw.city).trim() || undefined,
      state: asString(contactRaw.state).trim() || undefined,
      zipcode: asString(contactRaw.zipcode).trim() || undefined,
      portfolioUrl: asString(contactRaw.portfolioUrl).trim() || undefined,
      linkedinUrl: asString(contactRaw.linkedinUrl).trim() || undefined,
      githubUrl: asString(contactRaw.githubUrl).trim() || undefined,
    },
    coverLetter: asString(raw.coverLetter),
    targetRoles: asStringArray(raw.targetRoles),
    experiences: experiences
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .map((row) => ({
        company: asString(row.company).trim(),
        title: asString(row.title).trim(),
        location: asString(row.location).trim() || undefined,
        startDate: asString(row.startDate).trim(),
        endDate: asBoolean(row.current)
          ? null
          : asStringOrNull(row.endDate),
        current: asBoolean(row.current),
        summary: asString(row.summary).trim() || undefined,
        bullets: toTextItems(row.bullets),
        technologies: toTextItems(row.technologies),
        tags: asStringArray(row.tags),
      })),
    projects: projects
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
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
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
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
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .map((row) => ({
        category: asString(row.category).trim(),
        skills: toTextItems(row.skills),
        tags: asStringArray(row.tags),
      })),
    achievements: achievements
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .map((row) => ({
        title: asString(row.title).trim() || undefined,
        description: asString(row.description).trim(),
        relatedTo: asString(row.relatedTo).trim() || undefined,
        tags: asStringArray(row.tags),
      }))
      .filter((row) => row.description),
    faqs: faqs
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .map((row) => ({
        question: asString(row.question).trim(),
        answer: asString(row.answer),
      }))
      .filter((row) => row.question),
  };
}

/**
 * Builds a master profile payload from a raw data dump via AI.
 * `add` merges with `current`; `replace` uses only the dump.
 * Both modes return the same `UpsertProfileInput` shape (no entity ids).
 */
export async function masterFromDump(
  input: MasterFromDumpInput,
): Promise<UpsertProfileInput> {
  const dataDump = input.dataDump.trim();
  if (!dataDump) throw new Error("Data dump is required");

  const { text } = await generateAiText({
    prompt: buildPrompt({
      ...input,
      dataDump,
      current: input.mode === "add" ? input.current : null,
    }),
  });

  try {
    return normalizeMasterDump(parseJsonObject(text));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to parse AI master dump: ${error.message}`
        : "Failed to parse AI master dump",
    );
  }
}
