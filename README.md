# Job Hunter

Spend less time rewriting the same job application information.

Store your work history, skills, personal details, and common application answers in one place. Add a job posting and use that information (optionally with an AI model you bring) to create tailored resumes and cover letters.

**Live app:** [https://job-hunter-mu-inky.vercel.app/](https://job-hunter-mu-inky.vercel.app/)

No account required. Your information is **not** stored in a central user database — it stays in the browser you are using. API keys stay in **tab memory only** and are cleared on refresh.

Clone this repo if you want to run it locally or customize the React-PDF resume layout.

## What you can do

- **Build a reusable profile** — work experience, education, skills, accomplishments, and other details you reuse across applications
- **Save common answers** — why you’re interested in a role, preferred work environment, examples of past work, etc.
- **Tailor each application** — paste a posting and generate a tailored resume / cover letter with your own AI key
- **Track applications** — where you applied, which resume you used, status, interviews, offers, rejections
- **Customize PDFs in code** — restyle the `@react-pdf/renderer` document under `src/components/Resume/`

## How to use this tool

**This does not replace a carefully written resume.** The value is reuse: take the material you already worked hard to craft and apply it across many jobs without starting from a blank page each time. You still own the voice, the facts, and the final edit.

A workflow that works well in practice:

1. **Write and refine outside the app first.** Use a Google Doc (or similar) to gather your experience, projects, skills, and the details that make you unique. Edit until the writing is strong — Job Hunter is not a substitute for that craft.
2. **Load the master profile with Add from dump.** On **Profile**, paste that refined text and use **Add** (Add from dump) so the structured master resume is populated from what you already wrote. Review and fix anything the model mis-sorted.
3. **Keep the master honest as you grow.** When you earn new experience, write it carefully yourself, then add it to the master resume (manually or via dump). The master should stay your best, most complete source of truth.
4. **Tailor per job from the master — don’t start over.** When you apply, paste the posting under **Jobs**, then build a resume and cover letter for that niche case: pull from the master, emphasize what fits *this* role, and keep the specifics about you that make the application yours. Review before you submit.

AI can speed up structuring and first drafts. It should not be the only author of what you send an employer.

## Try it online

1. Open [job-hunter-mu-inky.vercel.app](https://job-hunter-mu-inky.vercel.app/).
2. Click **Create Your Profile**, refine your content (e.g. in a Google Doc), then use **Add** from dump on Profile — or enter it by hand.
3. Go to **Jobs** → **Apply**. If you use AI features, the **API key** modal opens — pick a model, paste a key, save.
4. Open a job, tailor from your master, preview the PDF, and download it.

API key setup guide (same as in the app): [Guides → How to get an API key](https://job-hunter-mu-inky.vercel.app/guides/api-keys).

---

## Getting started (local / custom PDFs)

### 1. Clone and install

```bash
git clone https://github.com/agustindevelops/job-hunter.git
cd job-hunter
npm install
```

### 2. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: seed API key and model from `.env`

For local development you can skip the API key modal by copying `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_AI_API_KEY` | Provider API key (any value works for Ollama, e.g. `ollama`) |
| `NEXT_PUBLIC_AI_MODEL` | Starting model id (e.g. `gpt-5.6-terra`, `llama3.2`) |
| `NEXT_PUBLIC_AI_BASE_URL` | Optional base URL override |

The app checks these **first** when loading AI config. Session overrides from the modal still win until you refresh. Restart the dev server after changing env values.

`NEXT_PUBLIC_*` variables are inlined into the client bundle — use them only locally; do not commit real keys.

Without `.env`, Next.js only serves the UI; profile data and AI calls still run in the browser, and the modal prompts for a key when needed.

### 3. Local workflow

Same idea as [How to use this tool](#how-to-use-this-tool): refine writing first, load the master (Add from dump or by hand), then tailor per job from that master. When an AI action needs a model, the app prompts for an API key (see below).

---

## How data is stored (browser / Dexie)

The live site and local builds use the same model: nothing is uploaded to a Job Hunter backend for storage.

Persistence uses the browser’s **IndexedDB**, wrapped by [Dexie](https://dexie.org/) (`dexie`) and reactive queries via [`dexie-react-hooks`](https://dexie.org/docs/dexie-react-hooks/useLiveQuery()) (`useLiveQuery`).

| Piece | Role |
| --- | --- |
| `src/db/index.ts` | Defines the `JobHunterDB` Dexie database and table indexes |
| `src/api/profile/`, `src/api/job/`, `src/api/application/` | Client-side data layer — these modules call Dexie directly (not HTTP APIs) |
| UI pages | Subscribe with `useLiveQuery(() => …)` so lists update when IndexedDB changes |

### Database shape

The IndexedDB database is named **`JobHunterDB`**. Important tables include:

- **`profiles` / `contacts`** — identity and contact details
- **`applications`** — a document tree for either the master profile or a job-specific tailored version (status, cover letter, etc.)
- **`experiences`, `projects`, `education`, `skillCategories`, `achievements`, `faqs`** — resume content rows, keyed to an `applicationId`
- **`jobs`** — saved postings; each can point at its own tailored `applicationId`
- **`tags`** (+ join tables) — tagging for content and jobs
- **`benefitTypes` / `jobBenefits`** — seeded benefit labels for job metadata

Conceptually: your **master profile** owns one application tree; applying to a job **clones** that content into a separate application for that job so you can tailor without overwriting the master (`createResume` in `src/api/application/createResume.ts`).

### Practical implications

Same rules as on the [live landing page](https://job-hunter-mu-inky.vercel.app/):

- Your information is not automatically uploaded to a central user database
- It is only available in the browser and device where you created it
- Switching browsers or devices creates a separate local workspace
- Clearing the browser’s site data may permanently remove your saved information
- Back up anything you do not want to lose (there is no automatic cloud backup)
- Wiping the local profile (`deleteProfile`) deletes the Dexie database and reseeds benefit types

API keys are **not** stored in IndexedDB (see next section).

---

## How API keys work

AI is **bring your own access**. The app never ships with a shared provider key and does not persist yours. As the UI states: your key, model, and endpoint are kept only in this browser tab’s memory — never written to a server, disk, or IndexedDB. Closing or refreshing the page clears them.

### Where the key lives

| Stored? | Where |
| --- | --- |
| Yes (session only) | React state in `AiConfigProvider` (`src/context/AiConfigContext.tsx`) |
| Yes (optional local) | `NEXT_PUBLIC_AI_API_KEY` / `NEXT_PUBLIC_AI_MODEL` in `.env.local` — checked first on load (`src/lib/aiEnvConfig.ts`) |
| No | IndexedDB, `localStorage`, cookies, or a Job Hunter server |

### How to add a key in the UI

On the [live app](https://job-hunter-mu-inky.vercel.app/jobs) or locally:

1. Go to **Jobs**.
2. Click **Apply** (or any action that needs AI). If no key is set, the **API key** modal opens automatically via `ensureConfig()`.
3. Choose a **model**, paste your **API key**, confirm/adjust the **base URL**, and **Save**.
4. After a key is saved for the session, an **API key** button appears on the Jobs toolbar so you can change the model/endpoint or delete the key.

You can also open the modal from profile AI actions (for example dumping text into the master resume). Full provider directories and pricing: [guides/api-keys](https://job-hunter-mu-inky.vercel.app/guides/api-keys).

### What happens under the hood

1. `ensureAiConfig()` (`src/api/ai/bridge.ts`) reads in-memory config, then optional `.env` defaults (`src/lib/aiEnvConfig.ts`), or opens the modal.
2. `createLanguageModel()` (`src/lib/aiClient.ts`) builds a [Vercel AI SDK](https://ai-sdk.dev/) model from your config.
3. Calls go **from the browser straight to the provider** (OpenAI, Anthropic, Google, Groq, or local Ollama) — not through a Job Hunter API route that holds your key.
4. Helpers like `generateAiText` / `streamAiText` (`src/api/ai/generate.ts`) gate every generation behind that key check.

Supported providers (configured in `src/lib/aiModels.ts`; also listed on the landing page):

- **OpenAI** — paid GPT models (`https://api.openai.com/v1`)
- **Anthropic** — paid Claude models (`https://api.anthropic.com/v1`)
- **Google AI Studio** — Gemini (free tier available)
- **Groq** — fast OpenAI-compatible hosted models
- **Ollama** — free local models (default base URL `http://localhost:11434/v1`; any key value works, e.g. `ollama`)

You can override **base URL** in the modal for a proxy or custom local endpoint.

**Privacy note:** content you send for generation is subject to the **provider’s** terms — not this app’s local storage model. Prefer Ollama if you want generation on your machine. Always review AI output before submitting applications. You are responsible for provider usage costs.

---

## Customizing the PDF resume

The printable resume is a React-PDF document under `src/components/Resume/`. Edit those components, then use **Preview** in the resume editor (or wait for the debounced preview).

| Path | What it controls |
| --- | --- |
| `src/components/Resume/index.tsx` | Document shell, page size, section order |
| `src/components/Resume/styles.ts` | Page padding, base font, text color |
| `src/components/Resume/Header/` | Name and headline |
| `src/components/Resume/Subheader/` | Contact / links row |
| `src/components/Resume/Experience/` | Work history |
| `src/components/Resume/Projects/` | Projects |
| `src/components/Resume/Skills/` | Skills |
| `src/components/Resume/Education/` | Education |
| `src/components/Resume/Section/` | Shared section chrome |

Each section has an `index.tsx` (structure) and a `styles.ts` (React-PDF `StyleSheet`). Data is typed as `ProfileBundle` in `src/types/profile.ts` — keep that shape in sync if you add fields.

The editor mounts the document in `src/components/Profile/ResumeEditor.tsx` with `<Resume data={…} />`, using `@react-pdf/renderer`’s `PDFViewer` and `pdf()` for preview and download.

**Typical customizations:**

- Reorder or hide sections in `Resume/index.tsx`
- Change margins, fonts, or colors in section `styles.ts` files
- Add a section component, mount it in `index.tsx`, and pass matching `ProfileBundle` data

---

## Project layout (high level)

```
src/
  api/           # Client-side domain logic (Dexie + AI helpers)
  components/    # UI, including Resume/ PDF and Profile/ editor
  context/       # AiConfigProvider (in-memory API key)
  db/            # Dexie schema (JobHunterDB)
  lib/           # aiClient, aiModels, form helpers, site constants
  types/         # DB + profile + AI types
  app/           # Next.js App Router pages (/, /profile, /jobs, /guides)
```

## Stack

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for the UI
- [Dexie](https://dexie.org/) + [dexie-react-hooks](https://dexie.org/docs/dexie-react-hooks/useLiveQuery()) for IndexedDB
- [@react-pdf/renderer](https://react-pdf.org/) for resume PDFs
- [Vercel AI SDK](https://ai-sdk.dev/) (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`) for optional generation
- [react-hook-form](https://react-hook-form.com/) for profile / job forms

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # serve production build
npm run lint   # ESLint
```

## Links

- **Live:** [https://job-hunter-mu-inky.vercel.app/](https://job-hunter-mu-inky.vercel.app/)
- **API keys guide:** [https://job-hunter-mu-inky.vercel.app/guides/api-keys](https://job-hunter-mu-inky.vercel.app/guides/api-keys)
- **Source:** [https://github.com/agustindevelops/job-hunter](https://github.com/agustindevelops/job-hunter)

## Disclaimer

This is a personal, independent project — not a staffing agency or employment service. It does not guarantee interviews, job offers, or the accuracy of AI-generated content. Always review generated resumes and cover letters before submitting them.
