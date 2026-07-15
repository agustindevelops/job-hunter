import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import AppHeader from "@/components/AppHeader";
import { GUIDES_PATH } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to get an API key · Job Hunter",
  description:
    "Why Job Hunter keeps API keys in tab memory only, plus directories for OpenAI, Anthropic, Google, Groq, and Ollama — with setup steps, links, and pricing snapshots.",
};

const externalLinkClass =
  "font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700";

type Resource = {
  name: string;
  href: string;
  note: string;
};

type PricingRow = {
  model: string;
  id: string;
  input: string;
  output: string;
  cached?: string;
  note?: string;
};

const sections = [
  { id: "security", label: "Tab-only keys" },
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "google", label: "Google" },
  { id: "groq", label: "Groq" },
  { id: "ollama", label: "Ollama" },
] as const;

const openaiResources: Resource[] = [
  {
    name: "Create an API key",
    href: "https://platform.openai.com/api-keys",
    note: "Official key dashboard — create, revoke, and name keys",
  },
  {
    name: "Sign up / log in",
    href: "https://platform.openai.com/signup",
    note: "OpenAI Platform account (separate from chatgpt.com chat plans)",
  },
  {
    name: "Quickstart",
    href: "https://platform.openai.com/docs/quickstart",
    note: "Official walkthrough for first API calls",
  },
  {
    name: "Where do I find my API key?",
    href: "https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key",
    note: "Help Center article with screenshots",
  },
  {
    name: "API pricing",
    href: "https://platform.openai.com/docs/pricing",
    note: "Live per-token rates — always check here before budgeting",
  },
  {
    name: "Billing settings",
    href: "https://platform.openai.com/settings/organization/billing",
    note: "Add a payment method and set usage limits",
  },
  {
    name: "Usage dashboard",
    href: "https://platform.openai.com/usage",
    note: "See spend and token volume in near real time",
  },
  {
    name: "Rate limits",
    href: "https://platform.openai.com/docs/guides/rate-limits",
    note: "Tier limits and how to request increases",
  },
  {
    name: "Best practices for API keys",
    href: "https://platform.openai.com/docs/guides/production-best-practices",
    note: "OpenAI guidance on rotating keys and least privilege",
  },
  {
    name: "Data controls / privacy",
    href: "https://platform.openai.com/settings/organization/data-controls",
    note: "Organization settings for how prompts may be used",
  },
];

const openaiPricingRows: PricingRow[] = [
  {
    model: "GPT-4o mini",
    id: "gpt-4o-mini",
    input: "$0.15",
    cached: "$0.075",
    output: "$0.60",
  },
  {
    model: "GPT-4o",
    id: "gpt-4o",
    input: "$2.50",
    cached: "$1.25",
    output: "$10.00",
  },
  {
    model: "GPT-4.1",
    id: "gpt-4.1",
    input: "$2.00",
    cached: "$0.50",
    output: "$8.00",
  },
  {
    model: "GPT-4.1 mini",
    id: "gpt-4.1-mini",
    input: "$0.40",
    cached: "$0.10",
    output: "$1.60",
  },
  {
    model: "o4-mini",
    id: "o4-mini",
    input: "$1.10",
    cached: "$0.275",
    output: "$4.40",
  },
];

const anthropicResources: Resource[] = [
  {
    name: "API keys",
    href: "https://console.anthropic.com/settings/keys",
    note: "Create and revoke sk-ant-… keys in the Claude Console",
  },
  {
    name: "Console home",
    href: "https://console.anthropic.com/",
    note: "Sign up / log in — Claude.ai chat plans are billed separately",
  },
  {
    name: "Get started",
    href: "https://docs.anthropic.com/en/docs/get-started",
    note: "First Messages API call with curl or an SDK",
  },
  {
    name: "Get an API key (docs)",
    href: "https://docs.anthropic.com/en/api/getting-started",
    note: "Official docs for authentication and headers",
  },
  {
    name: "Models overview",
    href: "https://docs.anthropic.com/en/docs/about-claude/models",
    note: "Compare Opus, Sonnet, and Haiku capabilities",
  },
  {
    name: "API pricing",
    href: "https://platform.claude.com/docs/en/about-claude/pricing",
    note: "Live Claude Platform rates including cache and batch",
  },
  {
    name: "Consumer / plans pricing",
    href: "https://www.anthropic.com/pricing",
    note: "Claude.ai plans vs API — useful so you do not mix products",
  },
  {
    name: "Billing",
    href: "https://console.anthropic.com/settings/billing",
    note: "Payment method, credits, and spend controls",
  },
  {
    name: "Usage",
    href: "https://console.anthropic.com/settings/usage",
    note: "Token volume and cost for your workspace",
  },
  {
    name: "Rate limits",
    href: "https://docs.anthropic.com/en/api/rate-limits",
    note: "Start / Build / Scale tiers and how limits work",
  },
  {
    name: "Prompt caching",
    href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    note: "Cut repeated input cost on long system prompts",
  },
  {
    name: "Privacy policy",
    href: "https://www.anthropic.com/legal/privacy",
    note: "How Anthropic handles API data",
  },
];

const anthropicPricingRows: PricingRow[] = [
  {
    model: "Claude Haiku 4.5",
    id: "claude-haiku-4-5",
    input: "$1.00",
    cached: "$0.10",
    output: "$5.00",
  },
  {
    model: "Claude Sonnet 4.5",
    id: "claude-sonnet-4-5",
    input: "$3.00",
    cached: "$0.30",
    output: "$15.00",
  },
  {
    model: "Claude Opus 4.5",
    id: "claude-opus-4-5",
    input: "$5.00",
    cached: "$0.50",
    output: "$25.00",
  },
  {
    model: "Claude Sonnet 5 (intro)",
    id: "claude-sonnet-5",
    input: "$2.00",
    cached: "$0.20",
    output: "$10.00",
    note: "Intro pricing through Aug 31, 2026; then $3 / $15",
  },
];

const googleResources: Resource[] = [
  {
    name: "Get API key (AI Studio)",
    href: "https://aistudio.google.com/apikey",
    note: "Create a Gemini key — free tier available without a card",
  },
  {
    name: "Google AI Studio",
    href: "https://aistudio.google.com/",
    note: "Try models in the browser before wiring Job Hunter",
  },
  {
    name: "API key docs",
    href: "https://ai.google.dev/gemini-api/docs/api-key",
    note: "Standard vs auth keys; migrate before Sept 2026",
  },
  {
    name: "Quickstart",
    href: "https://ai.google.dev/gemini-api/docs/quickstart",
    note: "First Gemini API call",
  },
  {
    name: "Models",
    href: "https://ai.google.dev/gemini-api/docs/models",
    note: "Flash, Pro, and preview model IDs",
  },
  {
    name: "API pricing",
    href: "https://ai.google.dev/gemini-api/docs/pricing",
    note: "Paid rates plus free-tier notes per model",
  },
  {
    name: "Rate limits",
    href: "https://ai.google.dev/gemini-api/docs/rate-limits",
    note: "RPM / TPM / RPD — check your live limits in AI Studio",
  },
  {
    name: "Billing setup",
    href: "https://ai.google.dev/gemini-api/docs/billing",
    note: "When to link Google Cloud billing for higher quotas",
  },
  {
    name: "Cloud Console billing",
    href: "https://console.cloud.google.com/billing",
    note: "Budgets and alerts once you leave the free tier",
  },
  {
    name: "Cloud credentials",
    href: "https://console.cloud.google.com/apis/credentials",
    note: "Restrict keys by API / IP if you manage them in GCP",
  },
  {
    name: "Privacy & terms",
    href: "https://ai.google.dev/gemini-api/terms",
    note: "Free-tier prompts may be used to improve products; paid differs",
  },
];

const googlePricingRows: PricingRow[] = [
  {
    model: "Gemini 2.5 Flash",
    id: "gemini-2.5-flash",
    input: "$0.30",
    cached: "$0.03",
    output: "$2.50",
    note: "Free tier available (rate-limited)",
  },
  {
    model: "Gemini 2.5 Pro (≤200k)",
    id: "gemini-2.5-pro",
    input: "$1.25",
    output: "$10.00",
    note: "Prompts up to 200k tokens",
  },
  {
    model: "Gemini 2.5 Pro (>200k)",
    id: "gemini-2.5-pro",
    input: "$2.50",
    output: "$15.00",
    note: "Long-context prompts over 200k tokens",
  },
];

const groqResources: Resource[] = [
  {
    name: "API keys",
    href: "https://console.groq.com/keys",
    note: "Create gsk-… keys — free tier needs no credit card",
  },
  {
    name: "GroqCloud console",
    href: "https://console.groq.com/",
    note: "Sign up with email, Google, or GitHub",
  },
  {
    name: "Quickstart",
    href: "https://console.groq.com/docs/quickstart",
    note: "First chat completion on Groq",
  },
  {
    name: "Supported models",
    href: "https://console.groq.com/docs/models",
    note: "Llama, Qwen, GPT-OSS, and more on LPUs",
  },
  {
    name: "OpenAI compatibility",
    href: "https://console.groq.com/docs/openai",
    note: "Same SDK shape — base URL api.groq.com/openai/v1",
  },
  {
    name: "On-demand pricing",
    href: "https://groq.com/pricing",
    note: "Live $/1M token rates and tokens-per-second",
  },
  {
    name: "Rate limits",
    href: "https://console.groq.com/docs/rate-limits",
    note: "Org-wide free-tier caps; paid raises limits",
  },
  {
    name: "Batch API",
    href: "https://console.groq.com/docs/batch",
    note: "~50% lower cost for async bulk jobs",
  },
  {
    name: "Billing / plans",
    href: "https://console.groq.com/settings/billing",
    note: "Upgrade when free RPM / TPD is not enough",
  },
  {
    name: "Playground",
    href: "https://console.groq.com/playground",
    note: "Try models in the console before pasting a key here",
  },
];

const groqPricingRows: PricingRow[] = [
  {
    model: "Llama 3.1 8B Instant",
    id: "llama-3.1-8b-instant",
    input: "$0.05",
    output: "$0.08",
    note: "~840 tok/s — cheapest Groq text option",
  },
  {
    model: "Llama 4 Scout",
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    input: "$0.11",
    output: "$0.34",
    note: "~594 tok/s",
  },
  {
    model: "Llama 3.3 70B Versatile",
    id: "llama-3.3-70b-versatile",
    input: "$0.59",
    output: "$0.79",
    note: "Model listed in Job Hunter (~394 tok/s)",
  },
  {
    model: "GPT-OSS 20B",
    id: "openai/gpt-oss-20b",
    input: "$0.075",
    output: "$0.30",
    note: "~1,000 tok/s",
  },
];

const ollamaResources: Resource[] = [
  {
    name: "Download Ollama",
    href: "https://ollama.com/download",
    note: "Installers for macOS, Windows, and Linux",
  },
  {
    name: "Model library",
    href: "https://ollama.com/library",
    note: "Browse tags such as llama3.2, mistral, qwen2.5",
  },
  {
    name: "llama3.2",
    href: "https://ollama.com/library/llama3.2",
    note: "Default local model option in Job Hunter",
  },
  {
    name: "mistral",
    href: "https://ollama.com/library/mistral",
    note: "Second local model option in Job Hunter",
  },
  {
    name: "GitHub repo",
    href: "https://github.com/ollama/ollama",
    note: "Source, issues, and release notes",
  },
  {
    name: "OpenAI compatibility",
    href: "https://ollama.com/blog/openai-compatibility",
    note: "Use /v1 chat completions — Job Hunter’s default path",
  },
  {
    name: "API docs",
    href: "https://github.com/ollama/ollama/blob/main/docs/api.md",
    note: "Native REST API if you need more than OpenAI-compat",
  },
  {
    name: "FAQ",
    href: "https://github.com/ollama/ollama/blob/main/docs/faq.md",
    note: "GPU, memory, and networking tips",
  },
  {
    name: "Modelfile docs",
    href: "https://github.com/ollama/ollama/blob/main/docs/modelfile.md",
    note: "Customize system prompts and parameters locally",
  },
];

function ExtLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={externalLinkClass}
    >
      {children}
    </a>
  );
}

function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <ul className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      {resources.map((resource) => (
        <li key={resource.href} className="px-4 py-3 sm:px-5">
          <ExtLink href={resource.href}>{resource.name}</ExtLink>
          <p className="mt-0.5 text-sm text-zinc-500">{resource.note}</p>
        </li>
      ))}
    </ul>
  );
}

function PricingTable({
  rows,
  showCached = false,
  pricingHref,
}: {
  rows: PricingRow[];
  showCached?: boolean;
  pricingHref: string;
}) {
  const hasNotes = rows.some((row) => row.note);

  return (
    <>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Standard API rates in USD per 1M tokens. Convenience snapshot
        only—prices change. Confirm on the{" "}
        <ExtLink href={pricingHref}>official pricing page</ExtLink>.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium sm:px-5">Model</th>
              <th className="px-4 py-3 font-medium sm:px-5">Input</th>
              {showCached ? (
                <th className="px-4 py-3 font-medium sm:px-5">Cached input</th>
              ) : null}
              <th className="px-4 py-3 font-medium sm:px-5">Output</th>
              {hasNotes ? (
                <th className="px-4 py-3 font-medium sm:px-5">Notes</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.id}-${row.note ?? row.model}`}
                className="border-b border-zinc-100 last:border-0"
              >
                <td className="px-4 py-3 sm:px-5">
                  <span className="font-medium text-zinc-900">{row.model}</span>
                  <span className="mt-0.5 block font-mono text-xs text-zinc-500">
                    {row.id}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700 sm:px-5">
                  {row.input}
                </td>
                {showCached ? (
                  <td className="px-4 py-3 tabular-nums text-zinc-700 sm:px-5">
                    {row.cached ?? "—"}
                  </td>
                ) : null}
                <td className="px-4 py-3 tabular-nums text-zinc-700 sm:px-5">
                  {row.output}
                </td>
                {hasNotes ? (
                  <td className="px-4 py-3 text-xs text-zinc-500 sm:px-5">
                    {row.note ?? "—"}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProviderSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ApiKeysGuidePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm text-zinc-500">
          <Link
            href={GUIDES_PATH}
            className="font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
          >
            Guides
          </Link>
          <span className="mx-1.5 text-zinc-400">/</span>
          API keys
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          How to get an API key
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600">
          A directory for bring-your-own AI: why Job Hunter never stores your
          key, then setup steps, resource links, and pricing snapshots for every
          provider the app supports.
        </p>

        <nav
          aria-label="On this page"
          className="mt-6 flex flex-wrap gap-2 text-sm"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <section
          id="security"
          className="mt-10 scroll-mt-20 rounded-lg border border-zinc-200 bg-white px-5 py-5 shadow-sm sm:px-6"
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Why the key only lives in this tab
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600">
            <p>
              Job Hunter is a local-first app. When you paste an API key, it is
              held in this browser tab’s memory for the current session so the
              app can call your chosen provider from your machine. It is not
              uploaded to our servers, written to disk, or saved in IndexedDB
              with your profile and jobs.
            </p>
            <p>
              Closing or refreshing the tab clears the key. That is intentional:
              a shared laptop, browser sync backup, or exported database dump
              should not leave a reusable credential behind. The tradeoff is
              that you re-enter the key when you start a new session—safer than
              persisting secrets by default.
            </p>
            <p>
              You still send prompts to the provider you pick (OpenAI,
              Anthropic, Google, Groq, or a local Ollama endpoint). Review that
              provider’s privacy policy and set billing limits before heavy use.
            </p>
          </div>
        </section>

        <ProviderSection id="openai" title="OpenAI">
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600">
            <li>
              Create or sign in to an{" "}
              <ExtLink href="https://platform.openai.com/signup">
                OpenAI Platform
              </ExtLink>{" "}
              account (API billing is separate from ChatGPT Plus).
            </li>
            <li>
              Open{" "}
              <ExtLink href="https://platform.openai.com/api-keys">
                API keys
              </ExtLink>
              , create a secret key, and copy it once—you will not see the full
              value again.
            </li>
            <li>
              Add a payment method and optional{" "}
              <ExtLink href="https://platform.openai.com/settings/organization/billing">
                usage limits
              </ExtLink>{" "}
              so a runaway loop cannot surprise-bill you.
            </li>
            <li>
              In Job Hunter, choose an OpenAI model, paste the key, and keep the
              default base URL unless you use a proxy.
            </li>
          </ol>

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Resource directory
          </h3>
          <ResourceList resources={openaiResources} />

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Pricing snapshot
          </h3>
          <PricingTable
            rows={openaiPricingRows}
            showCached
            pricingHref="https://platform.openai.com/docs/pricing"
          />
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Prefer mini models for resume/cover-letter drafts when quality is
            good enough. Set a monthly budget in billing either way.
          </p>
        </ProviderSection>

        <ProviderSection id="anthropic" title="Anthropic (Claude)">
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600">
            <li>
              Sign in to the{" "}
              <ExtLink href="https://console.anthropic.com/">
                Claude Console
              </ExtLink>{" "}
              (API access is separate from Claude.ai Pro / Max).
            </li>
            <li>
              Open{" "}
              <ExtLink href="https://console.anthropic.com/settings/keys">
                API keys
              </ExtLink>
              , create a key starting with{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                sk-ant-
              </code>
              , and store it somewhere safe—you only see it once.
            </li>
            <li>
              Add billing and review{" "}
              <ExtLink href="https://console.anthropic.com/settings/billing">
                spend controls
              </ExtLink>
              . Haiku is usually enough for drafting; Opus costs more.
            </li>
            <li>
              In Job Hunter, pick a Claude model and paste the key. Keep{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                https://api.anthropic.com/v1
              </code>{" "}
              unless you use a proxy.
            </li>
          </ol>

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Resource directory
          </h3>
          <ResourceList resources={anthropicResources} />

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Pricing snapshot
          </h3>
          <PricingTable
            rows={anthropicPricingRows}
            showCached
            pricingHref="https://platform.claude.com/docs/en/about-claude/pricing"
          />
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Cache-hit column is prompt-cache refresh pricing. Batch API is
            typically ~50% off standard rates. Job Hunter lists the 4.5 family;
            Sonnet 5 is shown as a newer Console option.
          </p>
        </ProviderSection>

        <ProviderSection id="google" title="Google (Gemini / AI Studio)">
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600">
            <li>
              Open{" "}
              <ExtLink href="https://aistudio.google.com/apikey">
                Google AI Studio → API keys
              </ExtLink>{" "}
              and sign in with a Google account.
            </li>
            <li>
              Create a key (new keys are auth keys by default). Copy it into Job
              Hunter for this session only—do not commit it to git.
            </li>
            <li>
              Start on the free tier if you are experimenting. When you need
              higher limits, link{" "}
              <ExtLink href="https://ai.google.dev/gemini-api/docs/billing">
                Cloud billing
              </ExtLink>{" "}
              and set budget alerts.
            </li>
            <li>
              Choose Gemini 2.5 Flash or Pro in Job Hunter. Restrict leaked or
              dormant keys in AI Studio; Google is{" "}
              <ExtLink href="https://ai.google.dev/gemini-api/docs/api-key">
                phasing out unrestricted standard keys
              </ExtLink>{" "}
              (full cutover planned for September 2026).
            </li>
          </ol>

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Resource directory
          </h3>
          <ResourceList resources={googleResources} />

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Pricing snapshot (paid tier)
          </h3>
          <PricingTable
            rows={googlePricingRows}
            showCached
            pricingHref="https://ai.google.dev/gemini-api/docs/pricing"
          />
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Free-tier prompts may be used to improve Google products; paid tier
            generally is not. Your live RPM/TPM/RPD limits live in AI Studio—not
            in blog posts.
          </p>
        </ProviderSection>

        <ProviderSection id="groq" title="Groq">
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600">
            <li>
              Create an account at the{" "}
              <ExtLink href="https://console.groq.com/">
                GroqCloud console
              </ExtLink>
              .
            </li>
            <li>
              Open{" "}
              <ExtLink href="https://console.groq.com/keys">API Keys</ExtLink>,
              create a{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                gsk-…
              </code>{" "}
              key, and paste it into Job Hunter. Free tier needs no card.
            </li>
            <li>
              Pick{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                llama-3.3-70b-versatile
              </code>{" "}
              (or another Groq model) and keep base URL{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                https://api.groq.com/openai/v1
              </code>
              .
            </li>
            <li>
              Watch{" "}
              <ExtLink href="https://console.groq.com/docs/rate-limits">
                org-wide rate limits
              </ExtLink>
              —extra keys do not multiply free quota. Upgrade billing when you
              outgrow them.
            </li>
          </ol>

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Resource directory
          </h3>
          <ResourceList resources={groqResources} />

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Pricing snapshot
          </h3>
          <PricingTable
            rows={groqPricingRows}
            pricingHref="https://groq.com/pricing"
          />
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Groq’s pitch is speed (hundreds of tokens/sec) at low $/1M. Batch
            API is about half of on-demand. Confirm live rates on groq.com/pricing.
          </p>
        </ProviderSection>

        <ProviderSection id="ollama" title="Ollama (local, no cloud key)">
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Prefer that resume text never leave your machine? Run a model
            locally. Job Hunter talks to Ollama’s OpenAI-compatible endpoint; the
            “API key” field can be any placeholder (for example{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
              ollama
            </code>
            ) because local auth is unused.
          </p>

          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600">
            <li>
              <ExtLink href="https://ollama.com/download">
                Download and install Ollama
              </ExtLink>
              , then start the app so the local server is running.
            </li>
            <li>
              Pull a model in a terminal, for example{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                ollama pull llama3.2
              </code>{" "}
              or{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                ollama pull mistral
              </code>
              .
            </li>
            <li>
              In Job Hunter, choose Llama 3.2 or Mistral (Ollama). Keep base URL{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                http://localhost:11434/v1
              </code>{" "}
              (note the{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
                /v1
              </code>{" "}
              for OpenAI compatibility).
            </li>
            <li>
              Enter any non-empty key value and save. Generation stays on your
              machine—your GPU/CPU and disk space are the real cost.
            </li>
          </ol>

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Resource directory
          </h3>
          <ResourceList resources={ollamaResources} />

          <h3 className="mt-8 text-base font-medium text-zinc-900">
            Cost snapshot
          </h3>
          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-xl text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-5">Item</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Cost</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900 sm:px-5">
                    Ollama software
                  </td>
                  <td className="px-4 py-3 text-zinc-700 sm:px-5">$0</td>
                  <td className="px-4 py-3 text-xs text-zinc-500 sm:px-5">
                    Free to download and run
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900 sm:px-5">
                    Model weights
                  </td>
                  <td className="px-4 py-3 text-zinc-700 sm:px-5">$0</td>
                  <td className="px-4 py-3 text-xs text-zinc-500 sm:px-5">
                    Download once; uses disk (often several GB each)
                  </td>
                </tr>
                <tr className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900 sm:px-5">
                    Inference
                  </td>
                  <td className="px-4 py-3 text-zinc-700 sm:px-5">
                    Your hardware
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 sm:px-5">
                    Electricity + time; no per-token cloud bill
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Quality and speed depend on your machine. Smaller models (8B-class)
            are friendlier on laptops; larger ones need more RAM/VRAM.
          </p>
        </ProviderSection>

        <aside
          className="mt-12 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-600"
          role="note"
        >
          You are responsible for provider usage costs and for any content you
          send to a third-party API. Job Hunter only keeps the key in memory so
          it never becomes part of your local data export—not so that cloud
          providers stop receiving your prompts. Prefer Ollama when you want
          generation to stay offline.
        </aside>
      </main>
    </div>
  );
}
