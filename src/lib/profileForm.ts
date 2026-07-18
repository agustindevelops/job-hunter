import type { UpsertApplicationInput } from "@/api/application";
import type {
  ProfileReadResult,
  UpsertProfileInput,
} from "@/api/profile";
import {
  cleanLinkItems,
  cleanTextItems,
  createLinkItem,
  createTextItem,
  textItemsToStrings,
  toLinkItems,
  toTextItems,
  type TextItem,
} from "@/lib/textItem";
import {
  DEFAULT_THEME_COLOR,
  normalizeThemeColor,
} from "@/lib/themeColor";
import type { PreferredLocationType, ProjectLink } from "@/types/db";
import type { ProfileBundle } from "@/types/profile";

export const PREFERRED_LOCATION_TYPES: Array<{
  value: PreferredLocationType;
  label: string;
}> = [
  { value: "any", label: "Any" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_site", label: "On-site" },
];

export type ProjectLinkFormItem = ProjectLink;

export type ExperienceFormItem = {
  entityId?: number;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  summary: string;
  bullets: TextItem[];
  technologies: TextItem[];
  tags: TextItem[];
};

export type ProjectFormItem = {
  entityId?: number;
  name: string;
  type: string;
  status: string;
  summary: string;
  bullets: TextItem[];
  technologies: TextItem[];
  links: ProjectLinkFormItem[];
  tags: TextItem[];
};

export type EducationFormItem = {
  entityId?: number;
  school: string;
  location: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  coursework: TextItem[];
  bullets: TextItem[];
  tags: TextItem[];
};

export type SkillCategoryFormItem = {
  entityId?: number;
  category: string;
  skills: TextItem[];
  tags: TextItem[];
};

export type AchievementFormItem = {
  entityId?: number;
  title: string;
  description: string;
  relatedTo: string;
  tags: TextItem[];
};

export type FaqFormItem = {
  entityId?: number;
  question: string;
  answer: string;
};

export type ProfileFormValues = {
  fullName: string;
  headline: string;
  summary: string;
  contact: {
    phone: string;
    email: string;
    city: string;
    state: string;
    zipcode: string;
    portfolioUrl: string;
    linkedinUrl: string;
    githubUrl: string;
  };
  coverLetter: string;
  targetRoles: TextItem[];
  idealJobDescription: string;
  preferredLocationType: PreferredLocationType;
  salaryMinExpectation: string;
  /** Resume PDF primary color (`#RRGGBB`). */
  themeColor: string;
  preferredBenefitNames: string[];
  experiences: ExperienceFormItem[];
  projects: ProjectFormItem[];
  education: EducationFormItem[];
  skillCategories: SkillCategoryFormItem[];
  achievements: AchievementFormItem[];
  faqs: FaqFormItem[];
};

export function createEmptyExperience(): ExperienceFormItem {
  return {
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    summary: "",
    bullets: [createTextItem()],
    technologies: [createTextItem()],
    tags: [createTextItem()],
  };
}

export function createEmptyProject(): ProjectFormItem {
  return {
    name: "",
    type: "",
    status: "",
    summary: "",
    bullets: [createTextItem()],
    technologies: [createTextItem()],
    links: [createLinkItem()],
    tags: [createTextItem()],
  };
}

export function createEmptyEducation(): EducationFormItem {
  return {
    school: "",
    location: "",
    degree: "",
    fieldOfStudy: "",
    graduationDate: "",
    coursework: [createTextItem()],
    bullets: [createTextItem()],
    tags: [createTextItem()],
  };
}

export function createEmptySkillCategory(): SkillCategoryFormItem {
  return {
    category: "",
    skills: [createTextItem()],
    tags: [createTextItem()],
  };
}

export function createEmptyAchievement(): AchievementFormItem {
  return {
    title: "",
    description: "",
    relatedTo: "",
    tags: [createTextItem()],
  };
}

export function createEmptyFaq(): FaqFormItem {
  return {
    question: "",
    answer: "",
  };
}

export const EMPTY_PROFILE_FORM: ProfileFormValues = {
  fullName: "",
  headline: "",
  summary: "",
  contact: {
    phone: "",
    email: "",
    city: "",
    state: "",
    zipcode: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
  },
  coverLetter: "",
  targetRoles: [createTextItem()],
  idealJobDescription: "",
  preferredLocationType: "any",
  salaryMinExpectation: "",
  themeColor: DEFAULT_THEME_COLOR,
  preferredBenefitNames: [],
  experiences: [],
  projects: [],
  education: [],
  skillCategories: [],
  achievements: [],
  faqs: [],
};

function asPreferredLocationType(value: unknown): PreferredLocationType {
  if (
    value === "remote" ||
    value === "hybrid" ||
    value === "on_site" ||
    value === "any"
  ) {
    return value;
  }
  return "any";
}

function parseOptionalSalary(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function readResultToFormValues(
  result: ProfileReadResult,
): ProfileFormValues {
  return {
    fullName: result.profile.fullName,
    headline: result.profile.headline,
    summary: result.profile.summary,
    contact: {
      phone: result.contact.phone ?? "",
      email: result.contact.email ?? "",
      city: result.contact.city ?? "",
      state: result.contact.state ?? "",
      zipcode: result.contact.zipcode ?? "",
      portfolioUrl: result.contact.portfolioUrl ?? "",
      linkedinUrl: result.contact.linkedinUrl ?? "",
      githubUrl: result.contact.githubUrl ?? "",
    },
    coverLetter: result.application.coverLetter,
    targetRoles: toTextItems(result.targetRoles.map((r) => r.role)),
    idealJobDescription: result.profile.idealJobDescription ?? "",
    preferredLocationType: asPreferredLocationType(
      result.profile.preferredLocationType,
    ),
    salaryMinExpectation:
      result.profile.salaryMinExpectation != null
        ? String(result.profile.salaryMinExpectation)
        : "",
    themeColor: normalizeThemeColor(result.theme.primaryColor),
    preferredBenefitNames: result.preferredBenefits.map((b) => b.name),
    experiences: result.application.experiences.map((e) => ({
      entityId: e.id,
      company: e.company,
      title: e.title,
      location: e.location ?? "",
      startDate: e.startDate,
      endDate: e.endDate ?? "",
      current: e.current ?? false,
      summary: e.summary ?? "",
      bullets: toTextItems(e.bullets),
      technologies: toTextItems(e.technologies),
      tags: toTextItems(e.tags),
    })),
    projects: result.application.projects.map((p) => ({
      entityId: p.id,
      name: p.name,
      type: p.type ?? "",
      status: p.status ?? "",
      summary: p.summary ?? "",
      bullets: toTextItems(p.bullets),
      technologies: toTextItems(p.technologies),
      links: toLinkItems(p.links),
      tags: toTextItems(p.tags),
    })),
    education: result.application.education.map((e) => ({
      entityId: e.id,
      school: e.school,
      location: e.location ?? "",
      degree: e.degree ?? "",
      fieldOfStudy: e.fieldOfStudy ?? "",
      graduationDate: e.graduationDate ?? "",
      coursework: toTextItems(e.coursework),
      bullets: toTextItems(e.bullets),
      tags: toTextItems(e.tags),
    })),
    skillCategories: result.application.skillCategories.map((s) => ({
      entityId: s.id,
      category: s.category,
      skills: toTextItems(s.skills),
      tags: toTextItems(s.tags),
    })),
    achievements: result.application.achievements.map((a) => ({
      entityId: a.id,
      title: a.title ?? "",
      description: a.description,
      relatedTo: a.relatedTo ?? "",
      tags: toTextItems(a.tags),
    })),
    faqs: result.application.faqs.map((f) => ({
      entityId: f.id,
      question: f.question,
      answer: f.answer,
    })),
  };
}

/** Profile identity + blank or existing job application content (never clones master). */
export function jobResumeToFormValues(result: {
  profile: ProfileReadResult["profile"];
  contact: ProfileReadResult["contact"];
  targetRoles: ProfileReadResult["targetRoles"];
  theme: ProfileReadResult["theme"];
  application: ProfileReadResult["application"] | null;
}): ProfileFormValues {
  if (!result.application) {
    return {
      ...EMPTY_PROFILE_FORM,
      fullName: result.profile.fullName,
      headline: result.profile.headline,
      summary: result.profile.summary,
      themeColor: normalizeThemeColor(result.theme.primaryColor),
      contact: {
        phone: result.contact.phone ?? "",
        email: result.contact.email ?? "",
        city: result.contact.city ?? "",
        state: result.contact.state ?? "",
        zipcode: result.contact.zipcode ?? "",
        portfolioUrl: result.contact.portfolioUrl ?? "",
        linkedinUrl: result.contact.linkedinUrl ?? "",
        githubUrl: result.contact.githubUrl ?? "",
      },
      targetRoles: toTextItems(result.targetRoles.map((r) => r.role)),
    };
  }

  return readResultToFormValues({
    profile: result.profile,
    contact: result.contact,
    targetRoles: result.targetRoles,
    preferredBenefits: [],
    theme: result.theme,
    application: result.application,
  });
}

function optionalId(value: number | undefined): number | undefined {
  return value != null && Number.isFinite(value) ? value : undefined;
}

export function formValuesToUpsertInput(
  values: ProfileFormValues,
): UpsertProfileInput {
  return {
    fullName: values.fullName.trim(),
    headline: values.headline.trim(),
    summary: values.summary.trim(),
    contact: {
      phone: values.contact.phone.trim() || undefined,
      email: values.contact.email.trim() || undefined,
      city: values.contact.city.trim() || undefined,
      state: values.contact.state.trim() || undefined,
      zipcode: values.contact.zipcode.trim() || undefined,
      portfolioUrl: values.contact.portfolioUrl.trim() || undefined,
      linkedinUrl: values.contact.linkedinUrl.trim() || undefined,
      githubUrl: values.contact.githubUrl.trim() || undefined,
    },
    coverLetter: values.coverLetter,
    targetRoles: textItemsToStrings(values.targetRoles),
    idealJobDescription: values.idealJobDescription,
    preferredLocationType: values.preferredLocationType,
    salaryMinExpectation: parseOptionalSalary(values.salaryMinExpectation),
    themeColor: normalizeThemeColor(values.themeColor),
    preferredBenefitNames: values.preferredBenefitNames,
    experiences: values.experiences.map((e) => ({
      id: optionalId(e.entityId),
      company: e.company.trim(),
      title: e.title.trim(),
      location: e.location.trim() || undefined,
      startDate: e.startDate.trim(),
      endDate: e.current ? null : e.endDate.trim() || null,
      current: e.current,
      summary: e.summary.trim() || undefined,
      bullets: cleanTextItems(e.bullets),
      technologies: cleanTextItems(e.technologies),
      tags: textItemsToStrings(e.tags),
    })),
    projects: values.projects.map((p) => ({
      id: optionalId(p.entityId),
      name: p.name.trim(),
      type: p.type.trim() || undefined,
      status: p.status.trim() || undefined,
      summary: p.summary.trim() || undefined,
      bullets: cleanTextItems(p.bullets),
      technologies: cleanTextItems(p.technologies),
      links: cleanLinkItems(p.links),
      tags: textItemsToStrings(p.tags),
    })),
    education: values.education.map((e) => ({
      id: optionalId(e.entityId),
      school: e.school.trim(),
      location: e.location.trim() || undefined,
      degree: e.degree.trim() || null,
      fieldOfStudy: e.fieldOfStudy.trim() || undefined,
      graduationDate: e.graduationDate.trim() || null,
      coursework: cleanTextItems(e.coursework),
      bullets: cleanTextItems(e.bullets),
      tags: textItemsToStrings(e.tags),
    })),
    skillCategories: values.skillCategories.map((s) => ({
      id: optionalId(s.entityId),
      category: s.category.trim(),
      skills: cleanTextItems(s.skills),
      tags: textItemsToStrings(s.tags),
    })),
    achievements: values.achievements.map((a) => ({
      id: optionalId(a.entityId),
      title: a.title.trim() || undefined,
      description: a.description.trim(),
      relatedTo: a.relatedTo.trim() || undefined,
      tags: textItemsToStrings(a.tags),
    })),
    faqs: values.faqs.map((f) => ({
      id: optionalId(f.entityId),
      question: f.question.trim(),
      answer: f.answer,
    })),
  };
}

export function formValuesToApplicationInput(
  values: ProfileFormValues,
): UpsertApplicationInput {
  const full = formValuesToUpsertInput(values);
  return {
    coverLetter: full.coverLetter,
    experiences: full.experiences,
    projects: full.projects,
    education: full.education,
    skillCategories: full.skillCategories,
    achievements: full.achievements,
    faqs: full.faqs,
  };
}

export function formValuesToProfileBundle(
  values: ProfileFormValues,
): ProfileBundle {
  return {
    profile: {
      fullName: values.fullName,
      headline: values.headline,
      summary: values.summary,
      phone: values.contact.phone || undefined,
      email: values.contact.email || undefined,
      city: values.contact.city || undefined,
      state: values.contact.state || undefined,
      zipcode: values.contact.zipcode || undefined,
      portfolioUrl: values.contact.portfolioUrl || undefined,
      linkedinUrl: values.contact.linkedinUrl || undefined,
      githubUrl: values.contact.githubUrl || undefined,
      themeColor: normalizeThemeColor(values.themeColor),
    },
    targetRoles: textItemsToStrings(values.targetRoles),
    experience: values.experiences.map((e) => ({
      company: e.company,
      title: e.title,
      location: e.location || undefined,
      startDate: e.startDate,
      endDate: e.current ? null : e.endDate || null,
      current: e.current,
      summary: e.summary || undefined,
      bullets: cleanTextItems(e.bullets),
      technologies: cleanTextItems(e.technologies),
      tags: textItemsToStrings(e.tags),
    })),
    projects: values.projects.map((p) => ({
      name: p.name,
      type: p.type || undefined,
      status: p.status || undefined,
      summary: p.summary || undefined,
      bullets: cleanTextItems(p.bullets),
      technologies: cleanTextItems(p.technologies),
      links: cleanLinkItems(p.links),
      tags: textItemsToStrings(p.tags),
    })),
    education: values.education.map((e) => ({
      school: e.school,
      location: e.location || undefined,
      degree: e.degree || null,
      fieldOfStudy: e.fieldOfStudy || undefined,
      graduationDate: e.graduationDate || null,
      coursework: cleanTextItems(e.coursework),
      bullets: cleanTextItems(e.bullets),
      tags: textItemsToStrings(e.tags),
    })),
    skills: values.skillCategories.map((s) => ({
      category: s.category,
      skills: cleanTextItems(s.skills),
      tags: textItemsToStrings(s.tags),
    })),
    achievements: values.achievements.map((a) => ({
      title: a.title || undefined,
      description: a.description,
      relatedTo: a.relatedTo || undefined,
      tags: textItemsToStrings(a.tags),
    })),
  };
}
