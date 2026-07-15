import type { UpsertApplicationInput } from "@/api/application/upsert";
import { createLinkItem, createTextItem } from "@/lib/textItem";
import type { TailoredApplicationResponse } from "./schema";
import type { SerializedMasterApplication } from "./serialize";

const SENSITIVE_FAQ_PATTERN =
  /work\s*auth|visa|citizen|salary|compensat|availability|relocat|location|sponsor|clearance|authorized to work|notice period|start date|remote policy/i;

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

function normalizeFaqs(
  master: SerializedMasterApplication,
  tailored: TailoredApplicationResponse["faqs"],
): UpsertApplicationInput["faqs"] {
  const tailoredByQuestion = new Map(
    tailored
      .map((faq) => ({
        question: faq.question.trim(),
        answer: faq.answer,
      }))
      .filter((faq) => faq.question)
      .map((faq) => [faq.question.toLowerCase(), faq] as const),
  );

  // Prefer master's FAQ set so sensitive / factual answers are not invented away.
  if (master.faqs.length > 0) {
    return master.faqs.map((masterFaq) => {
      const question = masterFaq.question.trim();
      const key = question.toLowerCase();
      const candidate = tailoredByQuestion.get(key);
      const sensitive = SENSITIVE_FAQ_PATTERN.test(question);

      if (sensitive || !candidate) {
        return { question, answer: masterFaq.answer };
      }

      const nextAnswer = candidate.answer.trim();
      return {
        question,
        answer: nextAnswer.length > 0 ? candidate.answer : masterFaq.answer,
      };
    });
  }

  return tailored
    .map((faq) => ({
      question: faq.question.trim(),
      answer: faq.answer,
    }))
    .filter((faq) => faq.question);
}

/**
 * Converts validated model output into persistence shape.
 * Applies trimming, current-role endDate nulling, TextItem conversion,
 * and FAQ safety merges against the master application.
 */
export function normalizeTailoredApplication(
  raw: TailoredApplicationResponse,
  master: SerializedMasterApplication,
): UpsertApplicationInput {
  return {
    coverLetter: raw.coverLetter.replace(/\r\n/g, "\n").trim(),
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
    faqs: normalizeFaqs(master, raw.faqs),
  };
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
