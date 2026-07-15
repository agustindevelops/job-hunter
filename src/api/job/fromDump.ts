import { generateAiText } from "@/api/ai";
import type { LocationType } from "@/types/db";

/**
 * Structured job fields extracted from a dump.
 * Does not include `dataDump` — callers keep the original text separately.
 */
export type JobFromDumpFields = {
  jobTitle: string;
  location: string;
  locationType: LocationType;
  salaryMin: number | null;
  salaryMax: number | null;
  minYearsOfExperience: string;
  maxYearsOfExperience: string;
  experienceLevel: string;
  body: string;
};

const LOCATION_TYPES: LocationType[] = [
  "hybrid",
  "remote",
  "on_site",
  "unknown",
];

const RESPONSE_SHAPE = `{
  "jobTitle": string,
  "location": string,
  "locationType": "hybrid" | "remote" | "on_site" | "unknown",
  "salaryMin": number | null,
  "salaryMax": number | null,
  "minYearsOfExperience": string,
  "maxYearsOfExperience": string,
  "experienceLevel": string,
  "body": string
}`;

function buildPrompt(dataDump: string): string {
  return `You extract structured job posting fields from a raw text dump (job listing paste, scraped posting, notes, etc.).

Return ONLY valid JSON matching this shape (no markdown fences, no commentary):
${RESPONSE_SHAPE}

Rules:
- Use only information present in the dump. Do not invent salary, location, or requirements.
- locationType must be one of: hybrid, remote, on_site, unknown.
- salaryMin / salaryMax are annual USD numbers when clearly stated; otherwise null. Do not convert hourly unless the dump gives an annual figure.
- minYearsOfExperience / maxYearsOfExperience are short strings (e.g. "3", "5+") or "" if unknown.
- experienceLevel is a short label (e.g. "Junior", "Mid", "Senior", "Staff") or "" if unknown.
- body should be a cleaned, readable job description (markdown ok). Prefer the full description from the dump; do not invent sections.
- Leave strings empty and salary null when the dump has nothing for that field.

Data dump:
${dataDump}`;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asLocationType(value: unknown): LocationType {
  return typeof value === "string" &&
    LOCATION_TYPES.includes(value as LocationType)
    ? (value as LocationType)
    : "unknown";
}

function parseJsonObject(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain JSON");
  }
  const parsed = JSON.parse(jsonMatch[0]) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI response JSON must be an object");
  }
  return parsed as Record<string, unknown>;
}

function normalizeJobDump(raw: Record<string, unknown>): JobFromDumpFields {
  return {
    jobTitle: asString(raw.jobTitle).trim(),
    location: asString(raw.location).trim(),
    locationType: asLocationType(raw.locationType),
    salaryMin: asNumberOrNull(raw.salaryMin),
    salaryMax: asNumberOrNull(raw.salaryMax),
    minYearsOfExperience: asString(raw.minYearsOfExperience).trim(),
    maxYearsOfExperience: asString(raw.maxYearsOfExperience).trim(),
    experienceLevel: asString(raw.experienceLevel).trim(),
    body: asString(raw.body).trim(),
  };
}

/**
 * Builds structured job fields from a raw data dump via AI.
 * The original dump is not returned — store it unchanged on the Job row.
 */
export async function jobFromDump(dataDump: string): Promise<JobFromDumpFields> {
  const dump = dataDump.trim();
  if (!dump) throw new Error("Data dump is required");

  const { text } = await generateAiText({
    prompt: buildPrompt(dump),
  });

  try {
    return normalizeJobDump(parseJsonObject(text));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to parse AI job dump: ${error.message}`
        : "Failed to parse AI job dump",
    );
  }
}
