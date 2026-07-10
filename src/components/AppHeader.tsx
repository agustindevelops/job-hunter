import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/site";

type AppHeaderProps = {
  cta?: ReactNode;
  children?: ReactNode;
};

export default function AppHeader({ cta, children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight text-zinc-900"
      >
        {SITE_NAME}
      </Link>
      <div className="flex items-center gap-2">
        {children}
        {cta}
      </div>
    </header>
  );
}
