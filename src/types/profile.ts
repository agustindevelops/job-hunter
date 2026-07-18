import type { TextItem, ProjectLink } from "@/types/db";

export type ProfileBundle = {
  profile: Profile;
  targetRoles: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: SkillCategory[];
  achievements?: Achievement[];
};

export type Profile = {
  fullName: string;
  headline: string;
  summary: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  /** Resume PDF primary / accent color (`#RRGGBB`). */
  themeColor?: string;
  tags?: string[];
};

export type Experience = {
  company: string;
  title: string;
  location?: string;
  startDate: string; // YYYY-MM
  endDate?: string | null; // YYYY-MM or null for current
  current?: boolean;

  summary?: string;
  bullets: TextItem[];

  technologies?: TextItem[];
  tags: string[];
};

export type Project = {
  name: string;
  type?: string; // personal, professional, school, freelance, etc.
  status?: string; // live, in_progress, archived, etc.

  summary?: string;
  bullets: TextItem[];

  technologies?: TextItem[];
  links?: ProjectLink[];
  tags: string[];
};

export type Education = {
  school: string;
  location?: string;
  degree?: string | null;
  fieldOfStudy?: string;
  graduationDate?: string | null;

  coursework?: TextItem[];
  bullets?: TextItem[];

  tags: string[];
};

export type SkillCategory = {
  category: string; // Frontend, Backend, Cloud, Design, Operations, etc.
  skills: TextItem[];
  tags?: string[];
};

export type Achievement = {
  title?: string;
  description: string;
  relatedTo?: string; // company, project, or experience name
  tags: string[];
};

export type Link = ProjectLink;
