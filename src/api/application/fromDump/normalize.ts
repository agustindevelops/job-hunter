import type { UpsertProfileInput } from "@/api/profile";
import { DEFAULT_THEME_COLOR } from "@/lib/themeColor";
import { createLinkItem, createTextItem } from "@/lib/textItem";
import type { MasterProfileResponse } from "./schema";
import type { SerializedMasterProfile } from "./serialize";
import type { MasterFromDumpMode } from "./types";

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

function contactField(value: string | null | undefined): string | undefined {
  return trimOrUndefined(value);
}

/**
 * Converts validated model output into UpsertProfileInput.
 */
export function normalizeMasterProfile(
  raw: MasterProfileResponse,
): UpsertProfileInput {
  return {
    fullName: raw.fullName.trim(),
    headline: raw.headline.trim(),
    summary: raw.summary.trim(),
    contact: {
      phone: contactField(raw.contact.phone),
      email: contactField(raw.contact.email),
      city: contactField(raw.contact.city),
      state: contactField(raw.contact.state),
      zipcode: contactField(raw.contact.zipcode),
      portfolioUrl: contactField(raw.contact.portfolioUrl),
      linkedinUrl: contactField(raw.contact.linkedinUrl),
      githubUrl: contactField(raw.contact.githubUrl),
    },
    coverLetter: raw.coverLetter.replace(/\r\n/g, "\n").trim(),
    targetRoles: raw.targetRoles.map((r) => r.trim()).filter(Boolean),
    idealJobDescription: "",
    preferredLocationType: "any",
    salaryMinExpectation: null,
    themeColor: DEFAULT_THEME_COLOR,
    preferredBenefitNames: [],
    experiences: raw.experiences.map((row) => {
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
    }),
    projects: raw.projects.map((row) => ({
      name: row.name.trim(),
      type: trimOrUndefined(row.type),
      status: trimOrUndefined(row.status),
      summary: trimOrUndefined(row.summary),
      bullets: toTextItems(row.bullets),
      technologies: toTextItems(row.technologies),
      links: row.links
        .map((link) => {
          const label = link.label.trim();
          const url = link.url.trim();
          if (!label && !url) return null;
          return createLinkItem(label, url);
        })
        .filter((link): link is NonNullable<typeof link> => link != null),
      tags: row.tags.map((t) => t.trim()).filter(Boolean),
    })),
    education: raw.education.map((row) => ({
      school: row.school.trim(),
      location: trimOrUndefined(row.location),
      degree: trimOrNull(row.degree),
      fieldOfStudy: trimOrUndefined(row.fieldOfStudy),
      graduationDate: trimOrNull(row.graduationDate),
      coursework: toTextItems(row.coursework),
      bullets: toTextItems(row.bullets),
      tags: row.tags.map((t) => t.trim()).filter(Boolean),
    })),
    skillCategories: raw.skillCategories.map((row) => ({
      category: row.category.trim(),
      skills: toTextItems(row.skills),
      tags: row.tags.map((t) => t.trim()).filter(Boolean),
    })),
    achievements: raw.achievements
      .map((row) => ({
        title: trimOrUndefined(row.title),
        description: row.description.trim(),
        relatedTo: trimOrUndefined(row.relatedTo),
        tags: row.tags.map((t) => t.trim()).filter(Boolean),
      }))
      .filter((row) => row.description),
    faqs: raw.faqs
      .map((row) => ({
        question: row.question.trim(),
        answer: row.answer,
      }))
      .filter((row) => row.question),
  };
}

/** Reject outputs that would wipe existing master content in add/merge mode. */
export function assertSafeMasterShape(
  mode: MasterFromDumpMode,
  prior: SerializedMasterProfile | null,
  next: UpsertProfileInput,
): void {
  const emptyCompanies = next.experiences.filter((e) => !e.company.trim());
  if (emptyCompanies.length > 0) {
    throw new Error("Master dump includes experiences without a company");
  }

  if (mode !== "add" || !prior) return;

  if (prior.experiences.length > 0 && next.experiences.length === 0) {
    throw new Error(
      "Merged profile dropped all work history; refusing to overwrite master",
    );
  }

  if (prior.education.length > 0 && next.education.length === 0) {
    throw new Error(
      "Merged profile dropped all education; refusing to overwrite master",
    );
  }

  if (prior.fullName.trim() && !next.fullName.trim()) {
    throw new Error(
      "Merged profile cleared full name; refusing to overwrite master",
    );
  }
}
