import type { UpsertApplicationInput } from "@/api/application/upsert";
import { createLinkItem, createTextItem } from "@/lib/textItem";
import type {
  TailoredApplicationResponse,
  TailoredExperience,
  TailoredProject,
  TailoredSkillsResponse,
} from "./schema";
import type { SerializedMasterApplication } from "./serialize";

function trimOrUndefined(value: string | null | undefined): string | undefined {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : undefined;
}

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toTextItems(values: string[]) {
  return values.map((text) => text.trim()).filter(Boolean).map(createTextItem);
}

function normalizeExperience(row: TailoredExperience) {
  const current = Boolean(row.current);
  return {
    company: row.company.trim(),
    title: row.title.trim(),
    location: trimOrUndefined(row.location),
    startDate: row.startDate.trim(),
    endDate: current ? null : trimOrNull(row.endDate),
    current,
    summary: trimOrUndefined(row.summary),
    bullets: toTextItems(row.bullets),
    technologies: toTextItems(row.technologies),
    tags: row.tags.map((t) => t.trim()).filter(Boolean),
  };
}

function normalizeProject(
  row: TailoredProject,
  masterLinks: SerializedMasterApplication["projects"][number]["links"],
) {
  const aiLinks = row.links
    .map((link) => {
      const label = link.label.trim();
      const url = link.url.trim();
      if (!label && !url) return null;
      return createLinkItem(label, url);
    })
    .filter((link): link is NonNullable<typeof link> => link != null);

  const links =
    aiLinks.length > 0
      ? aiLinks
      : masterLinks
          .map((link) => {
            const label = link.label.trim();
            const url = link.url.trim();
            if (!label && !url) return null;
            return createLinkItem(label, url);
          })
          .filter((link): link is NonNullable<typeof link> => link != null);

  return {
    name: row.name.trim(),
    type: trimOrUndefined(row.type),
    status: trimOrUndefined(row.status),
    summary: trimOrUndefined(row.summary),
    bullets: toTextItems(row.bullets),
    technologies: toTextItems(row.technologies),
    links,
    tags: row.tags.map((t) => t.trim()).filter(Boolean),
  };
}

/** Copy education from master without AI. */
export function copyEducationFromMaster(
  master: SerializedMasterApplication,
): UpsertApplicationInput["education"] {
  return master.education.map((row) => ({
    school: row.school.trim(),
    location: trimOrUndefined(row.location),
    degree: trimOrNull(row.degree ?? null),
    fieldOfStudy: trimOrUndefined(row.fieldOfStudy),
    graduationDate: trimOrNull(row.graduationDate ?? null),
    coursework: toTextItems(row.coursework),
    bullets: toTextItems(row.bullets),
    tags: row.tags.map((t) => t.trim()).filter(Boolean),
  }));
}

/**
 * Assemble persistence payload from segmented AI results.
 * Education is copied from master; FAQs are always empty.
 */
export function assembleTailoredApplication(input: {
  master: SerializedMasterApplication;
  experiences: TailoredExperience[];
  projects: TailoredProject[];
  skillCategories: TailoredSkillsResponse["skillCategories"];
  achievements: Array<{
    title: string | null;
    description: string;
    relatedTo: string | null;
    tags: string[];
  }>;
  coverLetter: string;
}): UpsertApplicationInput {
  const { master } = input;

  return {
    coverLetter: input.coverLetter.replace(/\r\n/g, "\n").trim(),
    experiences: input.experiences.map(normalizeExperience),
    projects: input.projects.map((project, index) =>
      normalizeProject(project, master.projects[index]?.links ?? []),
    ),
    education: copyEducationFromMaster(master),
    skillCategories: input.skillCategories.map((row) => ({
      category: row.category.trim(),
      skills: toTextItems(row.skills),
      tags: row.tags.map((t) => t.trim()).filter(Boolean),
    })),
    achievements: input.achievements
      .map((row) => ({
        title: trimOrUndefined(row.title),
        description: row.description.trim(),
        relatedTo: trimOrUndefined(row.relatedTo),
        tags: row.tags.map((t) => t.trim()).filter(Boolean),
      }))
      .filter((row) => row.description),
    faqs: [],
  };
}

/**
 * @deprecated Prefer assembleTailoredApplication for segmented matching.
 * Converts a full tailored response into persistence shape.
 */
export function normalizeTailoredApplication(
  raw: TailoredApplicationResponse,
  master: SerializedMasterApplication,
): UpsertApplicationInput {
  return assembleTailoredApplication({
    master,
    experiences: raw.experiences,
    projects: raw.projects,
    skillCategories: raw.skillCategories,
    achievements: raw.achievements,
    coverLetter: raw.coverLetter,
  });
}

/** Reject outputs that would wipe core master content. */
export function assertSafeTailoredShape(
  master: SerializedMasterApplication,
  tailored: UpsertApplicationInput,
): void {
  if (master.experiences.length > 0 && tailored.experiences.length === 0) {
    throw new Error(
      "Tailored application dropped all work history; refusing to overwrite",
    );
  }

  if (master.education.length > 0 && tailored.education.length === 0) {
    throw new Error(
      "Tailored application dropped all education; refusing to overwrite",
    );
  }

  const emptyCompanies = tailored.experiences.filter((e) => !e.company.trim());
  if (emptyCompanies.length > 0) {
    throw new Error("Tailored experiences include entries without a company");
  }
}
