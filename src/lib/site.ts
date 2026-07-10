export const SITE_NAME = "Job Hunter";
export const GITHUB_URL = "https://github.com/example/job-hunter";
export const PROFILE_PATH = "/profile";
export const JOBS_PATH = "/jobs";

export function jobPath(id: number | string) {
  return `${JOBS_PATH}/${id}`;
}
