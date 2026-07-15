"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { matchApplicationFromDump } from "@/api/application";
import { isAiConfigCancelledError } from "@/api/ai";
import type { JobReadResult } from "@/api/job";
import { jobFromDump, updateJob, type UpdateJobInput } from "@/api/job";
import Button from "@/components/Button";
import {
  fieldClassName,
  growingTextareaClassName,
  labelClassName,
} from "@/lib/formStyles";
import type { LocationType } from "@/types/db";

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_site", label: "On site" },
  { value: "unknown", label: "Unknown" },
];

type JobDetailsFormValues = {
  jobTitle: string;
  link: string;
  location: string;
  locationType: LocationType;
  salaryMin: string;
  salaryMax: string;
  minYearsOfExperience: string;
  maxYearsOfExperience: string;
  experienceLevel: string;
  body: string;
  dataDump: string;
};

function toFormValues(job: JobReadResult["job"]): JobDetailsFormValues {
  return {
    jobTitle: job.jobTitle ?? "",
    link: job.link ?? "",
    location: job.location ?? "",
    locationType: job.locationType ?? "unknown",
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
    minYearsOfExperience: job.minYearsOfExperience ?? "",
    maxYearsOfExperience: job.maxYearsOfExperience ?? "",
    experienceLevel: job.experienceLevel ?? "",
    body: job.body ?? "",
    dataDump: job.dataDump ?? "",
  };
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function locationLabel(type: LocationType): string {
  return LOCATION_TYPES.find((t) => t.value === type)?.label ?? type;
}

type JobDetailsPanelProps = {
  jobId: number;
  result: JobReadResult;
  onUpdated?: () => void;
};

export default function JobDetailsPanel({
  jobId,
  result,
  onUpdated,
}: JobDetailsPanelProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, getValues } =
    useForm<JobDetailsFormValues>({
      defaultValues: toFormValues(result.job),
    });

  useEffect(() => {
    reset(toFormValues(result.job));
  }, [result, reset]);

  async function onSave(values: JobDetailsFormValues) {
    setSaving(true);
    setError(null);
    try {
      const input: UpdateJobInput = {
        jobTitle: values.jobTitle,
        link: values.link,
        location: values.location,
        locationType: values.locationType,
        salaryMin: parseOptionalNumber(values.salaryMin),
        salaryMax: parseOptionalNumber(values.salaryMax),
        minYearsOfExperience: values.minYearsOfExperience,
        maxYearsOfExperience: values.maxYearsOfExperience,
        experienceLevel: values.experienceLevel,
        body: values.body,
        dataDump: values.dataDump,
      };
      await updateJob(jobId, input);
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    } finally {
      setSaving(false);
    }
  }

  async function handleMatchFromDump() {
    const dataDump = (
      editing ? getValues("dataDump") : result.job.dataDump
    ).trim();
    if (!dataDump) {
      setError("Add a data dump before matching");
      return;
    }

    setMatching(true);
    setError(null);
    try {
      const matched = await jobFromDump(dataDump);

      if (editing) {
        const current = getValues();
        reset({
          ...current,
          jobTitle: matched.jobTitle,
          location: matched.location,
          locationType: matched.locationType,
          salaryMin:
            matched.salaryMin != null ? String(matched.salaryMin) : "",
          salaryMax:
            matched.salaryMax != null ? String(matched.salaryMax) : "",
          minYearsOfExperience: matched.minYearsOfExperience,
          maxYearsOfExperience: matched.maxYearsOfExperience,
          experienceLevel: matched.experienceLevel,
          body: matched.body,
          dataDump,
        });
      } else {
        await updateJob(jobId, {
          link: result.job.link,
          jobTitle: matched.jobTitle,
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
      }

      // Clone master → tailored resume for this posting (core product value).
      await matchApplicationFromDump({
        jobId,
        dataDump,
        jobTitle: matched.jobTitle,
        jobBody: matched.body,
      });
      onUpdated?.();
    } catch (err) {
      if (isAiConfigCancelledError(err)) return;
      setError(
        err instanceof Error ? err.message : "Failed to match job from dump",
      );
    } finally {
      setMatching(false);
    }
  }

  function handleCancel() {
    reset(toFormValues(result.job));
    setError(null);
    setEditing(false);
  }

  const busy = saving || matching;

  const { job, tags, benefits } = result;
  const title = job.jobTitle.trim() || "Untitled job";
  const experience =
    [job.minYearsOfExperience, job.maxYearsOfExperience]
      .filter(Boolean)
      .join("–") || "—";

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Job details
          </p>
          {!editing ? (
            <h2 className="mt-1 text-base font-semibold wrap-break-word text-zinc-900">
              {title}
            </h2>
          ) : (
            <h2 className="mt-1 text-base font-semibold text-zinc-900">
              Edit job
            </h2>
          )}
        </div>
        {!editing ? (
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleMatchFromDump()}
              disabled={busy}
            >
              {matching ? "Matching…" : "Match from dump"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditing(true)}
              disabled={busy}
            >
              Edit
            </Button>
          </div>
        ) : (
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleMatchFromDump()}
              disabled={busy}
            >
              {matching ? "Matching…" : "Match from dump"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit(onSave)()}
              disabled={busy}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-5">
          {error}
        </div>
      ) : null}

      {editing ? (
        <form
          className="flex flex-col gap-4 px-4 py-4 sm:px-5"
          onSubmit={handleSubmit(onSave)}
        >
          <div>
            <label className={labelClassName} htmlFor="jobTitle">
              Job title
            </label>
            <input
              id="jobTitle"
              className={fieldClassName}
              {...register("jobTitle")}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="jobLink">
              Posting URL
            </label>
            <input
              id="jobLink"
              type="url"
              className={fieldClassName}
              {...register("link")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName} htmlFor="jobLocation">
                Location
              </label>
              <input
                id="jobLocation"
                className={fieldClassName}
                {...register("location")}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="locationType">
                Location type
              </label>
              <select
                id="locationType"
                className={fieldClassName}
                {...register("locationType")}
              >
                {LOCATION_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName} htmlFor="salaryMin">
                Salary min
              </label>
              <input
                id="salaryMin"
                type="number"
                className={fieldClassName}
                {...register("salaryMin")}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="salaryMax">
                Salary max
              </label>
              <input
                id="salaryMax"
                type="number"
                className={fieldClassName}
                {...register("salaryMax")}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClassName} htmlFor="minYears">
                Min years
              </label>
              <input
                id="minYears"
                className={fieldClassName}
                {...register("minYearsOfExperience")}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="maxYears">
                Max years
              </label>
              <input
                id="maxYears"
                className={fieldClassName}
                {...register("maxYearsOfExperience")}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="experienceLevel">
                Level
              </label>
              <input
                id="experienceLevel"
                className={fieldClassName}
                placeholder="Mid, Senior…"
                {...register("experienceLevel")}
              />
            </div>
          </div>
          <div>
            <label className={labelClassName} htmlFor="jobBody">
              Description
            </label>
            <textarea
              id="jobBody"
              rows={6}
              className={growingTextareaClassName}
              {...register("body")}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="dataDump">
              Raw posting / data dump
            </label>
            <textarea
              id="dataDump"
              rows={5}
              className={fieldClassName}
              disabled={busy}
              {...register("dataDump")}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Original dump is kept as-is. Match from dump refills job fields
              and clones your master resume, tailored for this posting.
            </p>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-zinc-500">Location</dt>
              <dd className="mt-0.5 text-sm text-zinc-900">
                {job.location.trim() || "—"}
                <span className="text-zinc-500">
                  {" "}
                  · {locationLabel(job.locationType)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Salary</dt>
              <dd className="mt-0.5 text-sm text-zinc-900">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Experience</dt>
              <dd className="mt-0.5 text-sm text-zinc-900">
                {experience}
                {job.experienceLevel.trim()
                  ? ` · ${job.experienceLevel.trim()}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Posting</dt>
              <dd className="mt-0.5 truncate text-sm">
                {job.link.trim() ? (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-zinc-900 underline underline-offset-2"
                  >
                    Open listing
                  </a>
                ) : (
                  <span className="text-zinc-900">—</span>
                )}
              </dd>
            </div>
          </dl>

          {tags.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-zinc-500">Tags</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag.id ?? tag.name}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {benefits.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-zinc-500">Benefits</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {benefits.map((b) => (
                  <span
                    key={b.id ?? b.name}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700"
                  >
                    {b.label || b.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-medium text-zinc-500">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
              {job.body.trim() || "No description yet."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
