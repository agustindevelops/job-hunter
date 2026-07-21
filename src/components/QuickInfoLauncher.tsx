"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { readProfile } from "@/api/profile";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { PROFILE_PATH } from "@/lib/site";

type InfoRow = {
  id: string;
  label: string;
  value: string;
};

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function QuickInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    const ok = await copyText(value);
    if (ok) setCopied(true);
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        <p className="mt-0.5 break-all font-mono text-sm text-zinc-900">
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="shrink-0"
        onClick={() => void handleCopy()}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export default function QuickInfoLauncher() {
  const [open, setOpen] = useState(false);
  const profileResult = useLiveQuery(() => readProfile(), []);

  const rows: InfoRow[] = [];
  if (profileResult) {
    const { profile, contact } = profileResult;
    const candidates: InfoRow[] = [
      { id: "name", label: "Name", value: profile.fullName?.trim() ?? "" },
      { id: "email", label: "Email", value: contact.email?.trim() ?? "" },
      { id: "phone", label: "Phone", value: contact.phone?.trim() ?? "" },
      {
        id: "portfolio",
        label: "Portfolio",
        value: contact.portfolioUrl?.trim() ?? "",
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        value: contact.linkedinUrl?.trim() ?? "",
      },
      {
        id: "github",
        label: "GitHub",
        value: contact.githubUrl?.trim() ?? "",
      },
    ];
    for (const row of candidates) {
      if (row.value) rows.push(row);
    }
  }

  const loading = profileResult === undefined;
  const hasProfile = profileResult != null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-800 shadow-lg transition hover:bg-zinc-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 sm:right-6 sm:bottom-6"
        aria-label="Open quick info to copy profile links"
        title="Quick info"
      >
        <InfoIcon />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Quick info"
        description="Copy the details forms keep asking for — portfolio, GitHub, LinkedIn, and more."
      >
        {loading ? (
          <p className="text-sm text-zinc-500">Loading profile…</p>
        ) : !hasProfile ? (
          <p className="text-sm text-zinc-600">
            No profile yet.{" "}
            <Link
              href={PROFILE_PATH}
              className="font-medium text-zinc-900 underline underline-offset-2"
              onClick={() => setOpen(false)}
            >
              Set up your profile
            </Link>{" "}
            to fill this panel.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Add portfolio, GitHub, LinkedIn, email, or phone on your{" "}
            <Link
              href={PROFILE_PATH}
              className="font-medium text-zinc-900 underline underline-offset-2"
              onClick={() => setOpen(false)}
            >
              profile
            </Link>{" "}
            to see them here.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {rows.map((row) => (
              <QuickInfoRow
                key={row.id}
                label={row.label}
                value={row.value}
              />
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v4.5" />
      <path d="M12 8h.01" />
    </svg>
  );
}
