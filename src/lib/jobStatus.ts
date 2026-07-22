import type { JobApplicationStatus } from "@/api/job/updateApplicationStatus";
import { isJobApplicationStatus } from "@/api/job/updateApplicationStatus";
import type { ApplicationStatus } from "@/types/db";

/** Display order: rejected last. */
export const JOB_STATUS_OPTIONS: {
  value: JobApplicationStatus;
  label: string;
}[] = [
  { value: "applied", label: "Applied" },
  { value: "interviewed", label: "Interviewed" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

/** Default table filters omit rejected. */
export const DEFAULT_STATUS_FILTERS: readonly JobApplicationStatus[] = [
  "applied",
  "interviewed",
  "accepted",
];

const SELECT_CLASSES: Record<JobApplicationStatus, string> = {
  applied:
    "border-zinc-200 bg-zinc-100 text-zinc-500",
  interviewed:
    "border-sky-200 bg-sky-50 text-sky-800",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected:
    "border-red-200 bg-red-50 text-red-700",
};

const FILTER_ACTIVE_CLASSES: Record<JobApplicationStatus, string> = {
  applied:
    "border-zinc-300 bg-zinc-200 text-zinc-700",
  interviewed:
    "border-sky-300 bg-sky-100 text-sky-800",
  accepted:
    "border-emerald-300 bg-emerald-100 text-emerald-800",
  rejected:
    "border-red-300 bg-red-100 text-red-700",
};

export function toJobStatus(
  status: ApplicationStatus | null | undefined,
): JobApplicationStatus {
  if (status && isJobApplicationStatus(status)) return status;
  return "applied";
}

export function jobStatusSelectClassName(status: JobApplicationStatus): string {
  return SELECT_CLASSES[status];
}

export function jobStatusFilterActiveClassName(
  status: JobApplicationStatus,
): string {
  return FILTER_ACTIVE_CLASSES[status];
}
