export type ResumeProfile = {
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
  bullets: string[];

  technologies?: string[];
  tags: string[];
};

export type Project = {
  name: string;
  type?: string; // personal, professional, school, freelance, etc.
  status?: string; // live, in_progress, archived, etc.

  summary?: string;
  bullets: string[];

  technologies?: string[];
  links?: Link[];
  tags: string[];
};

export type Education = {
  school: string;
  location?: string;
  degree?: string | null;
  fieldOfStudy?: string;
  graduationDate?: string | null;

  coursework?: string[];
  bullets?: string[];

  tags: string[];
};

export type SkillCategory = {
  category: string; // Frontend, Backend, Cloud, Design, Operations, etc.
  skills: string[];
  tags?: string[];
};

export type Achievement = {
  title?: string;
  description: string;
  relatedTo?: string; // company, project, or experience name
  tags: string[];
};

export type Link = {
  label: string;
  url: string;
};