"use client";

import { useState } from "react";
import {
  isJobApplicationStatus,
  updateJobApplicationStatus,
} from "@/api/job/updateApplicationStatus";
import {
  JOB_STATUS_OPTIONS,
  jobStatusSelectClassName,
  toJobStatus,
} from "@/lib/jobStatus";
import type { ApplicationStatus } from "@/types/db";

type JobStatusSelectProps = {
  jobId: number;
  status: ApplicationStatus | null;
};

export default function JobStatusSelect({
  jobId,
  status,
}: JobStatusSelectProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = toJobStatus(status);

  async function handleChange(next: string) {
    if (!isJobApplicationStatus(next) || next === current) return;
    setSaving(true);
    setError(null);
    try {
      await updateJobApplicationStatus(jobId, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-[5.75rem]">
      <div className="relative">
        <select
          className={`w-full cursor-pointer appearance-none rounded-md border py-1 pr-5 pl-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-wait disabled:opacity-60 ${jobStatusSelectClassName(current)}`}
          value={current}
          disabled={saving}
          aria-label="Application status"
          title={error ?? undefined}
          onChange={(event) => void handleChange(event.target.value)}
        >
          {JOB_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-current opacity-60"
          aria-hidden
        >
          <ChevronIcon />
        </span>
      </div>
      {error ? (
        <p className="mt-1 text-[10px] leading-tight text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-3 w-3"
    >
      <path
        fillRule="evenodd"
        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
