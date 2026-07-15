import type { ApplicationTree } from "@/api/application/_helpers";
import type { TextItem } from "@/types/db";

function textsOf(items: TextItem[] | undefined): string[] {
  return (items ?? []).map((item) => item.text).filter(Boolean);
}

/** Prompt-safe master payload: factual content without database ids. */
export type SerializedMasterApplication = {
  coverLetter: string;
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

export function serializeMasterForPrompt(
  tree: ApplicationTree,
): SerializedMasterApplication {
  return {
    coverLetter: tree.coverLetter ?? "",
    experiences: tree.experiences.map((row) => ({
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
    projects: tree.projects.map((row) => ({
      name: row.name,
      type: row.type,
      status: row.status,
      summary: row.summary,
      bullets: textsOf(row.bullets),
      technologies: textsOf(row.technologies),
      links: (row.links ?? []).map(({ label, url }) => ({ label, url })),
      tags: row.tags ?? [],
    })),
    education: tree.education.map((row) => ({
      school: row.school,
      location: row.location,
      degree: row.degree,
      fieldOfStudy: row.fieldOfStudy,
      graduationDate: row.graduationDate,
      coursework: textsOf(row.coursework),
      bullets: textsOf(row.bullets),
      tags: row.tags ?? [],
    })),
    skillCategories: tree.skillCategories.map((row) => ({
      category: row.category,
      skills: textsOf(row.skills),
      tags: row.tags ?? [],
    })),
    achievements: tree.achievements.map((row) => ({
      title: row.title,
      description: row.description,
      relatedTo: row.relatedTo,
      tags: row.tags ?? [],
    })),
    faqs: tree.faqs.map((row) => ({
      question: row.question,
      answer: row.answer,
    })),
  };
}
