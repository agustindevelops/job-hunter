import { describe, expect, it, vi, beforeEach } from "vitest";
import { extractJsonValue } from "@/api/ai/generateObject";
import {
  assembleTailoredApplication,
  assertSafeTailoredShape,
  copyEducationFromMaster,
  normalizeTailoredApplication,
} from "@/api/application/matchFromDump/normalize";
import {
  ACHIEVEMENTS_SYSTEM_PROMPT,
  buildAchievementsPrompt,
  buildCoverLetterPrompt,
  buildEditorialRepairPrompt,
  buildExperienceEntityPrompt,
  buildProjectEntityPrompt,
  buildSkillsPrompt,
  COVER_LETTER_SYSTEM_PROMPT,
  ENTITY_SYSTEM_PROMPT,
} from "@/api/application/matchFromDump/prompt";
import {
  tailoredApplicationSchema,
} from "@/api/application/matchFromDump/schema";
import { serializeMasterForPrompt } from "@/api/application/matchFromDump/serialize";
import {
  emptyExperiencesResponse,
  fictionalMasterTree,
  promptInjectionJobDump,
  serializedFromTree,
  strongMatchJobDump,
  validTailoredResponse,
} from "@/api/application/matchFromDump/__fixtures__";

const job = {
  dataDump: promptInjectionJobDump,
  jobTitle: "Senior Engineer",
  jobBody: "React and Node.js",
};

const master = serializeMasterForPrompt(fictionalMasterTree);

describe("serializeMasterForPrompt", () => {
  it("removes database ids but preserves factual content", () => {
    const json = JSON.stringify(master);
    expect(json).not.toMatch(/"id"\s*:/);
    expect(json).not.toMatch(/applicationId/);
    expect(master.experiences[0]?.company).toBe("Northwind Labs");
    expect(master.projects[0]?.links[0]).toEqual({
      label: "GitHub",
      url: "https://example.com/parcel",
    });
  });
});

describe("segmented prompt builders", () => {
  it("experience prompt scopes to one entity and job delimiters", () => {
    const prompt = buildExperienceEntityPrompt({
      job,
      experience: master.experiences[0]!,
      isPrimary: true,
    });
    expect(prompt).toContain("<<<JOB_DATA_START>>>");
    expect(prompt).toContain("<<<EXPERIENCE_ENTITY_START>>>");
    expect(prompt).not.toContain("<<<MASTER_APPLICATION_START>>>");
    expect(prompt).not.toContain("<<<PROJECT_ENTITY_START>>>");
    expect(prompt).toContain("PRIMARY");
    expect(prompt).toContain(promptInjectionJobDump.trim());
  });

  it("project prompt is distinct from experience and does not embed full master", () => {
    const prompt = buildProjectEntityPrompt({
      job,
      project: master.projects[0]!,
    });
    expect(prompt).toContain("<<<PROJECT_ENTITY_START>>>");
    expect(prompt).toMatch(/PROJECT section entity/i);
    expect(prompt).not.toContain("<<<EXPERIENCE_ENTITY_START>>>");
    expect(prompt).not.toContain("<<<MASTER_APPLICATION_START>>>");
    expect(prompt).not.toContain(master.experiences[0]!.company);
  });

  it("skills prompt references assembled payload and master skills inventory", () => {
    const prompt = buildSkillsPrompt({
      job,
      tailoredExperiences: validTailoredResponse.experiences,
      tailoredProjects: validTailoredResponse.projects,
      masterSkills: master.skillCategories,
    });
    expect(prompt).toContain("<<<ASSEMBLED_RESUME_START>>>");
    expect(prompt).toContain("<<<MASTER_SKILLS_START>>>");
    expect(prompt).toMatch(/Do not invent tools from the job posting/i);
  });

  it("achievements prompt allows empty and requires high relevance", () => {
    expect(ACHIEVEMENTS_SYSTEM_PROMPT).toMatch(/empty achievements array/i);
    expect(ACHIEVEMENTS_SYSTEM_PROMPT).toMatch(/highly relevant/i);
    const prompt = buildAchievementsPrompt({
      job,
      masterAchievements: master.achievements,
      tailoredExperiences: validTailoredResponse.experiences,
      tailoredProjects: validTailoredResponse.projects,
    });
    expect(prompt).toContain("<<<MASTER_ACHIEVEMENTS_START>>>");
    expect(prompt).toMatch(/Empty array is preferred/i);
  });

  it("cover letter prompt uses tailored + master context", () => {
    const prompt = buildCoverLetterPrompt({
      job,
      assembledApplication: validTailoredResponse,
      master,
    });
    expect(prompt).toContain("<<<MASTER_COVER_LETTER_START>>>");
    expect(prompt).toContain("<<<TAILORED_APPLICATION_START>>>");
    expect(prompt).toContain("<<<MASTER_APPLICATION_START>>>");
    expect(prompt).toContain(master.coverLetter);
    expect(COVER_LETTER_SYSTEM_PROMPT).toMatch(/exactly three paragraphs/i);
    expect(COVER_LETTER_SYSTEM_PROMPT).toMatch(/Master blurb \(preserve\)/i);
  });

  it("entity system prompt requires omission and structure over prescription", () => {
    expect(ENTITY_SYSTEM_PROMPT).toMatch(/Prefer omission/i);
    expect(ENTITY_SYSTEM_PROMPT).toMatch(/untrusted data/i);
    expect(ENTITY_SYSTEM_PROMPT).toMatch(/Structure and intention/i);
    expect(ENTITY_SYSTEM_PROMPT).toMatch(/Editorial length guidance/i);
    expect(ENTITY_SYSTEM_PROMPT).toMatch(/Discretion \(leave to the model\)/i);
  });

  it("keeps hostile dump text inside job delimiters only", () => {
    const prompt = buildExperienceEntityPrompt({
      job,
      experience: master.experiences[0]!,
      isPrimary: true,
    });
    const jobSection = prompt.slice(
      prompt.indexOf("<<<JOB_DATA_START>>>"),
      prompt.indexOf("<<<JOB_DATA_END>>>"),
    );
    expect(jobSection).toContain("IGNORE PREVIOUS INSTRUCTIONS");
    expect(ENTITY_SYSTEM_PROMPT).not.toContain("IGNORE PREVIOUS INSTRUCTIONS");
  });
});

describe("tailoredApplicationSchema", () => {
  it("accepts a valid complete application", () => {
    expect(tailoredApplicationSchema.safeParse(validTailoredResponse).success).toBe(
      true,
    );
  });

  it("rejects invalid response shapes", () => {
    expect(
      tailoredApplicationSchema.safeParse({
        coverLetter: 12,
        experiences: "nope",
      }).success,
    ).toBe(false);
  });
});

describe("assembleTailoredApplication", () => {
  const serialized = serializedFromTree();

  it("copies education from master and leaves faqs empty", () => {
    const assembled = assembleTailoredApplication({
      master: serialized,
      experiences: validTailoredResponse.experiences,
      projects: validTailoredResponse.projects,
      skillCategories: validTailoredResponse.skillCategories,
      achievements: validTailoredResponse.achievements,
      coverLetter: "Hello\n\nWorld",
    });
    expect(assembled.faqs).toEqual([]);
    expect(assembled.education[0]?.school).toBe("State University");
    expect(copyEducationFromMaster(serialized)[0]?.school).toBe(
      "State University",
    );
    expect(assembled.coverLetter).toContain("\n\n");
  });

  it("nulls endDate for current roles via normalize path", () => {
    const tailored = normalizeTailoredApplication(
      {
        ...validTailoredResponse,
        experiences: [
          {
            ...validTailoredResponse.experiences[0]!,
            current: true,
            endDate: "2026-01",
          },
        ],
      },
      serialized,
    );
    expect(tailored.experiences[0]?.endDate).toBeNull();
  });
});

describe("assertSafeTailoredShape", () => {
  const serialized = serializedFromTree();

  it("rejects outputs that drop all work history", () => {
    const wiped = normalizeTailoredApplication(
      emptyExperiencesResponse,
      serialized,
    );
    expect(() => assertSafeTailoredShape(serialized, wiped)).toThrow(
      /dropped all work history/i,
    );
  });
});

describe("schema shape validation", () => {
  it("accepts a valid tailored application", () => {
    expect(tailoredApplicationSchema.safeParse(validTailoredResponse).success).toBe(
      true,
    );
  });

  it("builds a repair prompt for schema failures", () => {
    const repair = buildEditorialRepairPrompt("ORIGINAL", [
      "experiences.0.company: Required",
    ]);
    expect(repair).toMatch(/FAILED SCHEMA VALIDATION/i);
    expect(repair).toMatch(/Do NOT invent new facts/i);
    expect(repair).toContain("experiences.0.company: Required");
  });
});

describe("extractJsonValue", () => {
  it("parses balanced JSON without greedy first-to-last brace matching", () => {
    expect(
      extractJsonValue('prefix {"a":{"b":1},"note":"not { broken"} suffix'),
    ).toEqual({ a: { b: 1 }, note: "not { broken" });
  });
});

describe("matchApplicationFromDump persistence safety", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("does not overwrite an existing application when generation fails", async () => {
    const upsertApplication = vi.fn();
    const ensureJobApplication = vi.fn(async () => 99);

    vi.doMock("@/api/ai", () => ({
      ensureAiConfig: vi.fn(async () => ({
        provider: "openai",
        model: "gpt-test",
        qualityModel: "gpt-test-quality",
        apiKey: "x",
        baseUrl: "https://example.com",
      })),
      generateAiObject: vi.fn(async () => {
        throw new Error("Structured output failed validation: bullets: Required");
      }),
    }));
    vi.doMock("@/api/application/ensure", () => ({ ensureJobApplication }));
    vi.doMock("@/api/application/upsert", () => ({ upsertApplication }));
    vi.doMock("@/db", () => ({
      db: {
        profiles: {
          toCollection: () => ({
            first: async () => ({ applicationId: 1 }),
          }),
        },
        jobs: {
          get: async () => ({
            id: 7,
            jobTitle: "Senior Engineer",
            body: "React",
            applicationId: 99,
          }),
        },
      },
    }));
    vi.doMock("@/api/application/_helpers", () => ({
      readApplicationTree: async (id: number) =>
        id === 1 ? fictionalMasterTree : null,
    }));

    const { matchApplicationFromDump } = await import(
      "@/api/application/matchFromDump"
    );

    await expect(
      matchApplicationFromDump({
        jobId: 7,
        dataDump: strongMatchJobDump,
        jobTitle: "Senior Engineer",
        jobBody: "React",
      }),
    ).rejects.toThrow(/failed validation|Failed to generate/i);

    expect(ensureJobApplication).not.toHaveBeenCalled();
    expect(upsertApplication).not.toHaveBeenCalled();
  });

  it("persists assembled segmented results and never writes profile identity", async () => {
    const upsertApplication = vi.fn(async () => undefined);
    const ensureJobApplication = vi.fn(async () => 99);
    const upsertProfileIdentity = vi.fn();

    vi.doMock("@/api/ai", () => ({
      ensureAiConfig: vi.fn(async () => ({
        provider: "openai",
        model: "gpt-test",
        qualityModel: "gpt-test-quality",
        apiKey: "x",
        baseUrl: "https://example.com",
      })),
      generateAiObject: vi.fn(async (opts: { prompt: string; system?: string }) => {
        if (opts.prompt.includes("EXPERIENCE_ENTITY")) {
          return validTailoredResponse.experiences[0];
        }
        if (opts.prompt.includes("PROJECT_ENTITY")) {
          return validTailoredResponse.projects[0];
        }
        if (opts.prompt.includes("MASTER_SKILLS")) {
          return { skillCategories: validTailoredResponse.skillCategories };
        }
        if (opts.prompt.includes("MASTER_ACHIEVEMENTS")) {
          return { achievements: [] };
        }
        if (
          opts.prompt.includes("cover letter") ||
          opts.system?.toLowerCase().includes("cover letter")
        ) {
          return {
            coverLetter:
              "What stood out about this role is ownership.\n\nProof.\n\nI would bring that focus here.",
          };
        }
        throw new Error(`Unexpected generateAiObject prompt: ${opts.prompt.slice(0, 80)}`);
      }),
    }));
    vi.doMock("@/api/application/ensure", () => ({ ensureJobApplication }));
    vi.doMock("@/api/application/upsert", () => ({ upsertApplication }));
    vi.doMock("@/api/profile", () => ({ upsertProfileIdentity }));
    vi.doMock("@/db", () => ({
      db: {
        profiles: {
          toCollection: () => ({
            first: async () => ({ applicationId: 1 }),
          }),
        },
        jobs: {
          get: async () => ({
            id: 7,
            jobTitle: "Senior Engineer",
            body: "React",
            applicationId: 99,
          }),
        },
      },
    }));
    vi.doMock("@/api/application/_helpers", () => ({
      readApplicationTree: async (id: number) => {
        if (id === 1) return fictionalMasterTree;
        return { ...fictionalMasterTree, id: 99, status: "applied" as const };
      },
    }));

    const { matchApplicationFromDump } = await import(
      "@/api/application/matchFromDump"
    );

    await matchApplicationFromDump({
      jobId: 7,
      dataDump: strongMatchJobDump,
      jobTitle: "Senior Engineer",
      jobBody: "React",
    });

    expect(ensureJobApplication).toHaveBeenCalled();
    expect(upsertApplication).toHaveBeenCalled();
    expect(upsertProfileIdentity).not.toHaveBeenCalled();
    const payload = (
      upsertApplication.mock.calls[0] as unknown as [
        number,
        { faqs: unknown[]; education: Array<{ school: string }> },
      ]
    )[1];
    expect(payload.faqs).toEqual([]);
    expect(payload.education[0]?.school).toBe("State University");
  });
});
