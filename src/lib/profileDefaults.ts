import { DEFAULT_THEME_COLOR } from "@/lib/themeColor";
import type { ProfileBundle } from "@/types/profile";

export const EMPTY_PROFILE_BUNDLE: ProfileBundle = {
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
    themeColor: DEFAULT_THEME_COLOR,
    tags: [],
  },
  targetRoles: [],
  experience: [],
  projects: [],
  education: [],
  skills: [],
  achievements: [],
};
