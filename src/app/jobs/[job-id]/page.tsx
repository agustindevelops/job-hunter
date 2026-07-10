"use client";

import { use } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import { readJob } from "@/api/job";
import { JOBS_PATH, PROFILE_PATH } from "@/lib/site";

type JobPageProps = {
  params: Promise<{
    "job-id": string;
  }>;
};

export default function JobPage({ params }: JobPageProps) {
  const { "job-id": jobIdParam } = use(params);
  const jobId = Number(jobIdParam);
  const result = useLiveQuery(async () => {
    if (!Number.isFinite(jobId)) return null;
    return readJob(jobId);
  }, [jobId]);

  const title =
    result === undefined
      ? "Loading…"
      : result
        ? result.job.jobTitle || "Untitled job"
        : "Job not found";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader cta={<Button href={PROFILE_PATH}>Edit profile</Button>}>
        <Button href={JOBS_PATH} variant="secondary">
          Back to jobs
        </Button>
      </AppHeader>

      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <h1 className="text-base font-semibold text-zinc-900">{title}</h1>

        {result === undefined ? (
          <p className="text-sm text-zinc-500">Loading job…</p>
        ) : result === null ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-5 py-8 text-center shadow-sm">
            <p className="text-sm text-zinc-600">
              No job found with id {jobIdParam}.
            </p>
            <Link
              href={JOBS_PATH}
              className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2"
            >
              Back to jobs
            </Link>
          </div>
        ) : (
          <pre className="overflow-auto rounded-lg border border-zinc-200 bg-white p-4 font-mono text-xs leading-relaxed text-zinc-800 shadow-sm sm:text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </main>
    </div>
  );
}
