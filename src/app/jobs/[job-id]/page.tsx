"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { isAiConfigCancelledError } from "@/api/ai";
import {
  ensureJobApplication,
  matchApplicationFromDump,
  upsertApplication,
} from "@/api/application";
import {
  clearJobApplication,
  jobFromDump,
  readJob,
  readJobResume,
  updateJob,
} from "@/api/job";
import { syncJobBenefits } from "@/api/job/syncBenefits";
import { upsertProfileIdentity } from "@/api/profile";
import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import JobDetailsPanel from "@/components/Jobs/JobDetailsPanel";
import ResumeEditor from "@/components/Profile/ResumeEditor";
import {
  formValuesToApplicationInput,
  formValuesToUpsertInput,
  jobResumeToFormValues,
  type ProfileFormValues,
} from "@/lib/profileForm";
import { JOBS_PATH } from "@/lib/site";

type JobPageProps = {
  params: Promise<{
    "job-id": string;
  }>;
};

function autoClearStorageKey(jobId: number) {
  return `job-hunter:cleared-auto-resume:v1:${jobId}`;
}

export default function JobPage({ params }: JobPageProps) {
  const { "job-id": jobIdParam } = use(params);
  const jobId = Number(jobIdParam);
  const [resumeKey, setResumeKey] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const jobResult = useLiveQuery(async () => {
    if (!Number.isFinite(jobId)) return null;
    return readJob(jobId);
  }, [jobId, resumeKey]);

  useEffect(() => {
    if (!Number.isFinite(jobId) || jobResult == null) return;
    if (typeof window === "undefined") return;
    const key = autoClearStorageKey(jobId);
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
    if (!jobResult.application) return;
    void clearJobApplication(jobId).then(() => {
      setResumeKey((k) => k + 1);
    });
  }, [jobId, jobResult]);

  const load = useCallback(async (): Promise<ProfileFormValues> => {
    const result = await readJobResume(jobId);
    if (!result) throw new Error(`Job ${jobIdParam} not found`);
    return jobResumeToFormValues(result);
  }, [jobId, jobIdParam]);

  const save = useCallback(
    async (values: ProfileFormValues): Promise<ProfileFormValues | void> => {
      const result = await readJobResume(jobId);
      if (!result) throw new Error(`Job ${jobIdParam} not found`);

      const full = formValuesToUpsertInput(values);
      await upsertProfileIdentity({
        fullName: full.fullName,
        headline: full.headline,
        summary: full.summary,
        contact: full.contact,
        targetRoles: full.targetRoles,
      });

      const applicationId =
        result.application?.id ?? (await ensureJobApplication(jobId));
      await upsertApplication(
        applicationId,
        formValuesToApplicationInput(values),
      );

      const refreshed = await readJobResume(jobId);
      if (refreshed) return jobResumeToFormValues(refreshed);
    },
    [jobId, jobIdParam],
  );

  async function handleClearResume() {
    setClearing(true);
    try {
      await clearJobApplication(jobId);
      setResumeKey((k) => k + 1);
    } finally {
      setClearing(false);
    }
  }

  async function handleMatchFromDump() {
    const job = jobResult?.job;
    if (!job) return;

    const dataDump = job.dataDump.trim();
    if (!dataDump) {
      setMatchError("Add a data dump before matching");
      return;
    }

    setMatching(true);
    setMatchError(null);
    try {
      const matched = await jobFromDump(dataDump);
      await updateJob(jobId, {
        link: job.link,
        jobTitle: matched.jobTitle,
        company: matched.company || job.company || "",
        location: matched.location,
        locationType: matched.locationType,
        salaryMin: matched.salaryMin,
        salaryMax: matched.salaryMax,
        minYearsOfExperience: matched.minYearsOfExperience,
        maxYearsOfExperience: matched.maxYearsOfExperience,
        experienceLevel: matched.experienceLevel,
        body: matched.body,
        dataDump,
      });
      await syncJobBenefits(jobId, matched.benefitNames);
      await matchApplicationFromDump({
        jobId,
        dataDump,
        jobTitle: matched.jobTitle,
        jobBody: matched.body,
      });
      setResumeKey((k) => k + 1);
    } catch (err) {
      if (isAiConfigCancelledError(err)) return;
      setMatchError(
        err instanceof Error ? err.message : "Failed to match job from dump",
      );
    } finally {
      setMatching(false);
    }
  }

  if (jobResult === null) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
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
        </main>
      </div>
    );
  }

  if (jobResult === undefined || !Number.isFinite(jobId)) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center p-6 text-sm text-zinc-500">
          Loading job…
        </main>
      </div>
    );
  }

  const hasApplication = jobResult.application != null;

  return (
    <ResumeEditor
      reloadKey={`${jobId}-${resumeKey}`}
      companyName={jobResult.job.company?.trim() || undefined}
      toolbarActions={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={matching || clearing}
            onClick={() => void handleMatchFromDump()}
          >
            {matching ? "Matching…" : "Match from dump"}
          </Button>
          {hasApplication ? (
            <Button
              type="button"
              variant="secondary"
              disabled={clearing || matching}
              onClick={() => void handleClearResume()}
            >
              {clearing ? "Clearing…" : "Clear resume"}
            </Button>
          ) : null}
        </>
      }
      beforeForm={
        <>
          {matchError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {matchError}
            </div>
          ) : null}
          <JobDetailsPanel
            jobId={jobId}
            result={jobResult}
            onUpdated={() => setResumeKey((k) => k + 1)}
          />
        </>
      }
      loadingLabel="Loading job resume…"
      load={load}
      save={save}
    />
  );
}
