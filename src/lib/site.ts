export const SITE_NAME = "Job Hunter";
export const GITHUB_URL = "https://github.com/example/job-hunter";
export const PROFILE_PATH = "/profile";
export const JOBS_PATH = "/jobs";
export const GUIDES_PATH = "/guides";

export function jobPath(id: number | string) {
  return `${JOBS_PATH}/${id}`;
}

export function guidePath(slug: string) {
  return `${GUIDES_PATH}/${slug}`;
}

export const API_KEYS_GUIDE_PATH = guidePath("api-keys");
