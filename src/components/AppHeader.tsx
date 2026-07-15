"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JOBS_PATH, PROFILE_PATH, SITE_NAME } from "@/lib/site";

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.25c1.6-3.1 3.9-4.5 6.5-4.5s4.9 1.4 6.5 4.5" />
    </svg>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const onJobs =
    pathname === JOBS_PATH || pathname.startsWith(`${JOBS_PATH}/`);
  const onProfile = pathname === PROFILE_PATH || pathname.startsWith(`${PROFILE_PATH}/`);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight text-zinc-900"
      >
        {SITE_NAME}
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2">
        <Link
          href={JOBS_PATH}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            onJobs
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          Jobs
        </Link>
        <Link
          href={PROFILE_PATH}
          aria-label="Profile"
          title="Profile"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${
            onProfile
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          <ProfileIcon className="h-5 w-5" />
        </Link>
      </nav>
    </header>
  );
}
