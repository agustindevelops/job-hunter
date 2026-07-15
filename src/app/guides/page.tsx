import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { API_KEYS_GUIDE_PATH } from "@/lib/site";

export const metadata: Metadata = {
  title: "Guides · Job Hunter",
  description:
    "How-to guides for Job Hunter — API keys, privacy, and getting started with bring-your-own AI.",
};

const guides = [
  {
    href: API_KEYS_GUIDE_PATH,
    title: "How to get an API key",
    summary:
      "Why keys stay in tab memory only, plus setup steps, resource directories, and pricing for OpenAI, Anthropic, Google, Groq, and Ollama.",
  },
] as const;

export default function GuidesPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Guides
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600">
          Short how-tos for using Job Hunter safely. More guides will land here
          over time; start with API keys if you are connecting a model.
        </p>

        <ul className="mt-8 space-y-3">
          {guides.map((guide) => (
            <li key={guide.href}>
              <Link
                href={guide.href}
                className="block rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <span className="text-base font-medium text-zinc-900">
                  {guide.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-zinc-600">
                  {guide.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
