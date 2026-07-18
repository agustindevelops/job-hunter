export type LocationType = "hybrid" | "remote" | "on_site" | "unknown";

/** Preferred work arrangement for ideal-job preferences. */
export type PreferredLocationType = "remote" | "hybrid" | "on_site" | "any";

export type ApplicationStatus =
  | "master"
  | "applied"
  | "rejected"
  | "interviewed"
  | "accepted";

/** Identifiable string entry for bullets, skills, technologies, etc. */
export type TextItem = {
  id: string;
  text: string;
};

export type Contact = {
  id?: number;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

export type ApplicationRow = {
  id?: number;
  status: ApplicationStatus;
  /** Markdown — master: personal blurb; tailored: cover letter */
  coverLetter: string;
};

export type ProfileRow = {
  id?: number;
  contactId: number;
  applicationId: number;
  fullName: string;
  headline: string;
  summary: string;
  /** Free-form description of the user's ideal job. */
  idealJobDescription?: string;
  preferredLocationType?: PreferredLocationType;
  /** Minimum annual USD salary expectation. */
  salaryMinExpectation?: number | null;
};

/** One theme per profile (resume PDF primary color). */
export type Theme = {
  id?: number;
  profileId: number;
  /** Resume PDF primary / accent color (`#RRGGBB`). */
  primaryColor: string;
};

export type TargetRole = {
  id?: number;
  profileId: number;
  role: string;
};

export type ExperienceRow = {
  id?: number;
  applicationId: number;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  summary?: string;
  bullets: TextItem[];
  technologies?: TextItem[];
};

export type ProjectLink = {
  id: string;
  label: string;
  url: string;
};

export type ProjectRow = {
  id?: number;
  applicationId: number;
  name: string;
  type?: string;
  status?: string;
  summary?: string;
  bullets: TextItem[];
  technologies?: TextItem[];
  links?: ProjectLink[];
};

export type EducationRow = {
  id?: number;
  applicationId: number;
  school: string;
  location?: string;
  degree?: string | null;
  fieldOfStudy?: string;
  graduationDate?: string | null;
  coursework?: TextItem[];
  bullets?: TextItem[];
};

export type SkillCategoryRow = {
  id?: number;
  applicationId: number;
  category: string;
  skills: TextItem[];
};

export type AchievementRow = {
  id?: number;
  applicationId: number;
  title?: string;
  description: string;
  relatedTo?: string;
};

export type FaqRow = {
  id?: number;
  applicationId: number;
  question: string;
  /** Markdown */
  answer: string;
};

export type Tag = {
  id?: number;
  name: string;
};

export type ExperienceTag = {
  id?: number;
  experienceId: number;
  tagId: number;
};

export type ProjectTag = {
  id?: number;
  projectId: number;
  tagId: number;
};

export type EducationTag = {
  id?: number;
  educationId: number;
  tagId: number;
};

export type SkillCategoryTag = {
  id?: number;
  skillCategoryId: number;
  tagId: number;
};

export type AchievementTag = {
  id?: number;
  achievementId: number;
  tagId: number;
};

export type BenefitType = {
  id?: number;
  name: string;
  label?: string;
};

export type Job = {
  id?: number;
  contactId: number;
  applicationId?: number | null;
  link: string;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string;
  locationType: LocationType;
  minYearsOfExperience: string;
  maxYearsOfExperience: string;
  experienceLevel: string;
  jobTitle: string;
  dataDump: string;
  body: string;
  /** Average of the three compatibility metrics (1–5), one decimal. */
  compatibilityScore?: number | null;
  compatibilityQualification?: number | null;
  compatibilityQualificationReason?: string;
  compatibilityPreference?: number | null;
  compatibilityPreferenceReason?: string;
  compatibilityCompensation?: number | null;
  compatibilityCompensationReason?: string;
};

export type JobTag = {
  id?: number;
  jobId: number;
  tagId: number;
};

export type JobBenefit = {
  id?: number;
  jobId: number;
  benefitTypeId: number;
};

export type ProfileBenefit = {
  id?: number;
  profileId: number;
  benefitTypeId: number;
};
