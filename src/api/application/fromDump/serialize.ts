import type { UpsertProfileInput } from "@/api/profile";
import type { TextItem } from "@/types/db";

function textsOf(items: TextItem[] | undefined): string[] {
  return (items ?? []).map((item) => item.text).filter(Boolean);
}

/** Prompt-safe profile payload without database ids. */
export type SerializedMasterProfile = {
  fullName: string;
  headline: string;
  summary: string;
  contact: UpsertProfileInput["contact"];
  coverLetter: string;
  targetRoles: string[];
  experiences: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string | null;
    current?: boolean;
    summary?: string;
    bullets: string[];
    technologies: string[];
    tags: string[];
  }>;
  projects: Array<{
    name: string;
    type?: string;
    status?: string;
    summary?: string;
    bullets: string[];
    technologies: string[];
    links: Array<{ label: string; url: string }>;
    tags: string[];
  }>;
  education: Array<{
    school: string;
    location?: string;
    degree?: string | null;
    fieldOfStudy?: string;
    graduationDate?: string | null;
    coursework: string[];
    bullets: string[];
    tags: string[];
  }>;
  skillCategories: Array<{
    category: string;
    skills: string[];
    tags: string[];
  }>;
  achievements: Array<{
    title?: string;
    description: string;
    relatedTo?: string;
    tags: string[];
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export function emptySerializedProfile(): SerializedMasterProfile {
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

export function serializeProfileForPrompt(
  input: UpsertProfileInput,
): SerializedMasterProfile {
  return {
    fullName: input.fullName,
    headline: input.headline,
    summary: input.summary,
    contact: input.contact,
    coverLetter: input.coverLetter ?? "",
    targetRoles: input.targetRoles,
    experiences: input.experiences.map((row) => ({
      company: row.company,
      title: row.title,
      location: row.location,
      startDate: row.startDate,
      endDate: row.endDate,
      current: row.current,
      summary: row.summary,
      bullets: textsOf(row.bullets),
      technologies: textsOf(row.technologies),
      tags: row.tags ?? [],
    })),
    projects: input.projects.map((row) => ({
      name: row.name,
      type: row.type,
      status: row.status,
      summary: row.summary,
      bullets: textsOf(row.bullets),
      technologies: textsOf(row.technologies),
      links: (row.links ?? []).map(({ label, url }) => ({ label, url })),
      tags: row.tags ?? [],
    })),
    education: input.education.map((row) => ({
      school: row.school,
      location: row.location,
      degree: row.degree,
      fieldOfStudy: row.fieldOfStudy,
      graduationDate: row.graduationDate,
      coursework: textsOf(row.coursework),
      bullets: textsOf(row.bullets),
      tags: row.tags ?? [],
    })),
    skillCategories: input.skillCategories.map((row) => ({
      category: row.category,
      skills: textsOf(row.skills),
      tags: row.tags ?? [],
    })),
    achievements: input.achievements.map((row) => ({
      title: row.title,
      description: row.description,
      relatedTo: row.relatedTo,
      tags: row.tags ?? [],
    })),
    faqs: input.faqs.map((row) => ({
      question: row.question,
      answer: row.answer,
    })),
  };
}
