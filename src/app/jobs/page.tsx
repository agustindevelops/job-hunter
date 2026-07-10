"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import ApiKeyModal from "@/components/Jobs/ApiKeyModal";
import ApplyJobModal from "@/components/Jobs/ApplyJobModal";
import DeleteJobModal from "@/components/Jobs/DeleteJobModal";
import { useAiConfig } from "@/context/AiConfigContext";
import { db } from "@/db";
import { jobPath, PROFILE_PATH } from "@/lib/site";

type PendingDelete = {
  id: number;
  title: string;
};

export default function JobsPage() {
  const { config } = useAiConfig();
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [openApplyAfterSave, setOpenApplyAfterSave] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  const jobs = useLiveQuery(() => db.jobs.orderBy("id").reverse().toArray());

  function handleApplyClick() {
    if (!config) {
      setOpenApplyAfterSave(true);
      setApiKeyOpen(true);
      return;
    }
    setApplyOpen(true);
  }

  function handleManageApiKey() {
    setOpenApplyAfterSave(false);
    setApiKeyOpen(true);
  }

  function handleApiKeyClose() {
    setApiKeyOpen(false);
    setOpenApplyAfterSave(false);
  }

  function handleApiKeySaved() {
    setApiKeyOpen(false);
    if (openApplyAfterSave) {
      setOpenApplyAfterSave(false);
      setApplyOpen(true);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader cta={<Button href={PROFILE_PATH}>Edit profile</Button>} />

      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3 sm:px-5">
            <h1 className="text-base font-semibold text-zinc-900">
              Jobs Applied To
            </h1>
            <div className="flex items-center gap-2">
              {config ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleManageApiKey}
                >
                  API key
                </Button>
              ) : null}
              <Button type="button" onClick={handleApplyClick}>
                Apply
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-xl text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-5">Title</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Location</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Link</th>
                  <th className="w-12 px-4 py-3 font-medium sm:px-5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs === undefined ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-zinc-500 sm:px-5"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-zinc-500 sm:px-5"
                    >
                      No applications yet. Click Apply to get started.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <Link
                          href={jobPath(job.id!)}
                          className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                        >
                          {job.jobTitle || "Untitled"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 sm:px-5">
                        {job.location || "—"}
                      </td>
                      <td className="max-w-64 truncate px-4 py-3 sm:px-5">
                        {job.link ? (
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
                          >
                            {job.link}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelete({
                              id: job.id!,
                              title: job.jobTitle || "Untitled",
                            })
                          }
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
                          aria-label={`Delete ${job.jobTitle || "Untitled"}`}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ApiKeyModal
        open={apiKeyOpen}
        onClose={handleApiKeyClose}
        onSaved={handleApiKeySaved}
      />
      <ApplyJobModal open={applyOpen} onClose={() => setApplyOpen(false)} />
      <DeleteJobModal
        open={pendingDelete != null}
        jobId={pendingDelete?.id ?? null}
        jobTitle={pendingDelete?.title ?? ""}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
