import type { ResumeProfile } from "@/types/resume";

export const EMPTY_RESUME_PROFILE: ResumeProfile = {
  profile: {
    fullName: "",
    headline: "",
    summary: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    zipcode: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    tags: [],
  },
  targetRoles: [],
  experience: [],
  projects: [],
  education: [],
  skills: [],
  achievements: [],
};
