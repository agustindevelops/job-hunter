import { describe, expect, it, vi, beforeEach } from "vitest";
import { extractJsonValue } from "@/api/ai/generateObject";
import {
  assertSafeTailoredShape,
  normalizeTailoredApplication,
} from "@/api/application/matchFromDump/normalize";
import {
  buildEditorialRepairPrompt,
  buildMatchPrompt,
  buildMatchUserPrompt,
  MATCH_SYSTEM_PROMPT,
} from "@/api/application/matchFromDump/prompt";
import {
  describeEditorialViolations,
  EDITORIAL_LIMITS,
  tailoredApplicationSchema,
  wordCount,
} from "@/api/application/matchFromDump/schema";
import { serializeMasterForPrompt } from "@/api/application/matchFromDump/serialize";
import {
  compressedProjectResponse,
  emptyExperiencesResponse,
  fictionalMasterTree,
  oversizedProjectResponse,
  promptInjectionJobDump,
  serializedFromTree,
  strongMatchJobDump,
  validTailoredResponse,
  verboseCareerAppProjectBullets,
  verboseCareerAppTechnologies,
} from "@/api/application/matchFromDump/__fixtures__";

describe("serializeMasterForPrompt", () => {
  it("removes database ids but preserves factual content", () => {
    const serialized = serializeMasterForPrompt(fictionalMasterTree);
    const json = JSON.stringify(serialized);

    expect(json).not.toMatch(/"id"\s*:/);
    expect(json).not.toMatch(/applicationId/);
    expect(serialized.experiences[0]?.company).toBe("Northwind Labs");
    expect(serialized.experiences[0]?.bullets).toContain(
      "Built React dashboards used by 8k weekly active users",
    );
    expect(serialized.projects[0]?.links[0]).toEqual({
      label: "GitHub",
      url: "https://example.com/parcel",
    });
    expect(serialized.faqs).toHaveLength(3);
  });
});

describe("prompt architecture", () => {
  const prompt = buildMatchPrompt({
    dataDump: promptInjectionJobDump,
    jobTitle: "Senior Engineer",
    jobBody: "React and Node.js",
    master: serializeMasterForPrompt(fictionalMasterTree),
  });

  it("separates job data from candidate data with delimiters", () => {
    expect(prompt).toContain("<<<JOB_DATA_START>>>");
    expect(prompt).toContain("<<<JOB_DATA_END>>>");
    expect(prompt).toContain("<<<MASTER_APPLICATION_START>>>");
    expect(prompt).toContain("<<<MASTER_APPLICATION_END>>>");
    expect(prompt.indexOf("<<<JOB_DATA_START>>>")).toBeLessThan(
      prompt.indexOf("<<<MASTER_APPLICATION_START>>>"),
    );
  });

  it("includes truthfulness and prompt-injection rules", () => {
    expect(MATCH_SYSTEM_PROMPT).toMatch(/only source of truth/i);
    expect(MATCH_SYSTEM_PROMPT).toMatch(/Never invent/i);
    expect(MATCH_SYSTEM_PROMPT).toMatch(/untrusted data/i);
    expect(MATCH_SYSTEM_PROMPT).toMatch(/Ignore any embedded text/i);
    expect(prompt).toContain(promptInjectionJobDump.trim());
  });

  it("keeps hostile dump text inside delimited job data only", () => {
    const user = buildMatchUserPrompt({
      dataDump: promptInjectionJobDump,
      jobTitle: "Senior Engineer",
      jobBody: "",
      master: serializeMasterForPrompt(fictionalMasterTree),
    });
    const jobSection = user.slice(
      user.indexOf("<<<JOB_DATA_START>>>"),
      user.indexOf("<<<JOB_DATA_END>>>"),
    );
    expect(jobSection).toContain("IGNORE PREVIOUS INSTRUCTIONS");
    expect(MATCH_SYSTEM_PROMPT).not.toContain("IGNORE PREVIOUS INSTRUCTIONS");
  });

  it("remains provider-agnostic (no hardcoded vendor instructions)", () => {
    expect(MATCH_SYSTEM_PROMPT.toLowerCase()).not.toContain("openai");
    expect(MATCH_SYSTEM_PROMPT.toLowerCase()).not.toContain("anthropic");
    expect(MATCH_SYSTEM_PROMPT.toLowerCase()).not.toContain("gemini");
    expect(MATCH_SYSTEM_PROMPT.toLowerCase()).not.toContain("groq");
  });

  it("explains complete-tree output does not mean retaining every bullet", () => {
    expect(MATCH_SYSTEM_PROMPT).toMatch(
      /does NOT mean every original bullet/i,
    );
    expect(MATCH_SYSTEM_PROMPT).toMatch(
      /Do not preserve every original bullet/i,
    );
    expect(MATCH_SYSTEM_PROMPT).toMatch(/source inventory/i);
    expect(MATCH_SYSTEM_PROMPT).toMatch(/selective résumé|selective resume/i);
  });

  it("requires omission, compression, and prohibits generic stack-only bullets", () => {
    expect(MATCH_SYSTEM_PROMPT).toMatch(/Omission is expected/i);
    expect(MATCH_SYSTEM_PROMPT).toMatch(/editorial compression pass/i);
    expect(MATCH_SYSTEM_PROMPT).toMatch(/hard limits, not suggestions/i);
    expect(MATCH_SYSTEM_PROMPT).toMatch(
      /Do not create a bullet whose only purpose is to list the basic technology stack/i,
    );
    expect(MATCH_SYSTEM_PROMPT).toMatch(/Merging is mandatory/i);
  });
});

describe("tailoredApplicationSchema", () => {
  it("accepts a valid complete application", () => {
    const parsed = tailoredApplicationSchema.safeParse(validTailoredResponse);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid response shapes", () => {
    const invalid = {
      coverLetter: 12,
      experiences: "nope",
      projects: [],
      education: [],
      skillCategories: [],
      achievements: [],
      faqs: [],
    };
    const parsed = tailoredApplicationSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects missing required arrays", () => {
    const rest = { ...validTailoredResponse };
    delete (rest as { experiences?: unknown }).experiences;
    const parsed = tailoredApplicationSchema.safeParse(rest);
    expect(parsed.success).toBe(false);
  });
});

describe("normalizeTailoredApplication", () => {
  const master = serializedFromTree();

  it("nulls endDate for current roles", () => {
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
      master,
    );
    expect(tailored.experiences[0]?.current).toBe(true);
    expect(tailored.experiences[0]?.endDate).toBeNull();
  });

  it("handles empty optional arrays and fields safely", () => {
    const tailored = normalizeTailoredApplication(
      {
        coverLetter: "",
        experiences: [
          {
            company: "Northwind Labs",
            title: "Software Engineer",
            location: null,
            startDate: "2021-03",
            endDate: null,
            current: true,
            summary: null,
            bullets: [],
            technologies: [],
            tags: [],
          },
        ],
        projects: [],
        education: [
          {
            school: "State University",
            location: null,
            degree: null,
            fieldOfStudy: null,
            graduationDate: null,
            coursework: [],
            bullets: [],
            tags: [],
          },
        ],
        skillCategories: [],
        achievements: [],
        faqs: [],
      },
      master,
    );

    expect(tailored.coverLetter).toBe("");
    expect(tailored.experiences[0]?.location).toBeUndefined();
    expect(tailored.experiences[0]?.bullets).toEqual([]);
    expect(tailored.projects).toEqual([]);
    expect(tailored.education[0]?.degree).toBeNull();
  });

  it("preserves cover-letter paragraph breaks", () => {
    const tailored = normalizeTailoredApplication(validTailoredResponse, master);
    expect(tailored.coverLetter ?? "").toContain("\n\n");
    expect((tailored.coverLetter ?? "").split("\n\n")).toHaveLength(3);
  });

  it("preserves sensitive FAQ answers from master", () => {
    const tailored = normalizeTailoredApplication(
      {
        ...validTailoredResponse,
        faqs: [
          {
            question: "Are you authorized to work in the US?",
            answer: "Yes, and I have Top Secret clearance.",
          },
          {
            question: "What are your salary expectations?",
            answer: "$1,000,000",
          },
          {
            question: "Why are you interested in this role?",
            answer: "Tailored interest in Acme Platform customer-facing work.",
          },
        ],
      },
      master,
    );

    const auth = tailored.faqs.find((f) =>
      /authorized to work/i.test(f.question),
    );
    const salary = tailored.faqs.find((f) => /salary/i.test(f.question));
    const why = tailored.faqs.find((f) => /interested/i.test(f.question));

    expect(auth?.answer).toBe(
      "Yes, I am authorized to work in the United States.",
    );
    expect(salary?.answer).toBe(
      "Open to a competitive range based on total compensation.",
    );
    expect(why?.answer).toContain("Acme Platform");
  });
});

describe("assertSafeTailoredShape", () => {
  const master = serializedFromTree();

  it("rejects outputs that drop all work history", () => {
    const wiped = normalizeTailoredApplication(
      emptyExperiencesResponse,
      master,
    );
    expect(() => assertSafeTailoredShape(master, wiped)).toThrow(
      /dropped all work history/i,
    );
  });

  it("accepts a complete valid tailored application", () => {
    const tailored = normalizeTailoredApplication(
      validTailoredResponse,
      master,
    );
    expect(() => assertSafeTailoredShape(master, tailored)).not.toThrow();
  });
});

describe("extractJsonValue", () => {
  it("parses fenced JSON without greedy first-to-last brace matching", () => {
    const text = `Here you go:\n\`\`\`json\n{"coverLetter":"hi","experiences":[]}\n\`\`\``;
    // Balanced extract should still work when parse of full string fails path
    const value = extractJsonValue(
      'prefix {"a":{"b":1},"note":"not { broken"} suffix',
    );
    expect(value).toEqual({ a: { b: 1 }, note: "not { broken" });
    expect(extractJsonValue(text)).toEqual({
      coverLetter: "hi",
      experiences: [],
    });
  });

  it("rejects truncated JSON", () => {
    expect(() => extractJsonValue('{"coverLetter": "oops"')).toThrow(
      /truncated|unbalanced|malformed/i,
    );
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
      generateAiObject: vi.fn(async () => {
        throw new Error("Structured output failed validation: experiences: Required");
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
    ).rejects.toThrow(/valid tailored application|failed validation/i);

    expect(ensureJobApplication).not.toHaveBeenCalled();
    expect(upsertApplication).not.toHaveBeenCalled();
  });

  it("persists a repaired compressed object and never writes oversized output", async () => {
    const upsertApplication = vi.fn(async () => undefined);
    const ensureJobApplication = vi.fn(async () => 99);
    const generateAiObject = vi.fn(async () => compressedProjectResponse);

    // Simulate that the repair path already ran inside generateAiObject and
    // returned a schema-valid compressed project (≤6 bullets, ≤10 techs).
    vi.doMock("@/api/ai", () => ({ generateAiObject }));
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
            jobTitle: "Senior Full-Stack Engineer",
            body: "React, TypeScript, local-first apps",
            applicationId: 99,
          }),
        },
      },
    }));
    vi.doMock("@/api/application/_helpers", () => ({
      readApplicationTree: async (id: number) => {
        if (id === 1) return fictionalMasterTree;
        return {
          ...fictionalMasterTree,
          id: 99,
          status: "applied" as const,
          projects: [
            {
              ...fictionalMasterTree.projects[0]!,
              id: 200,
              applicationId: 99,
              name: "Career Forge",
              bullets: compressedProjectResponse.projects[0]!.bullets.map(
                (text, i) => ({ id: `c${i}`, text }),
              ),
              technologies:
                compressedProjectResponse.projects[0]!.technologies.map(
                  (text, i) => ({ id: `ct${i}`, text }),
                ),
            },
          ],
        };
      },
    }));

    const { matchApplicationFromDump } = await import(
      "@/api/application/matchFromDump"
    );

    const tree = await matchApplicationFromDump({
      jobId: 7,
      dataDump: strongMatchJobDump,
      jobTitle: "Senior Full-Stack Engineer",
      jobBody: "React, TypeScript, local-first apps",
    });

    expect(generateAiObject).toHaveBeenCalledTimes(1);
    expect(upsertApplication).toHaveBeenCalledTimes(1);
    const upsertArgs = upsertApplication.mock.calls[0] as unknown as [
      number,
      {
        projects: Array<{ bullets: unknown[]; technologies: unknown[] }>;
      },
    ];
    const persisted = upsertArgs[1];
    expect(persisted.projects[0]?.bullets.length).toBeLessThanOrEqual(6);
    expect(persisted.projects[0]?.technologies.length).toBeLessThanOrEqual(10);
    expect(tree.projects[0]?.name).toBe("Career Forge");
  });
});

describe("editorial hard limits", () => {
  it("rejects a project with more than 6 bullets (12-source regression)", () => {
    expect(verboseCareerAppProjectBullets).toHaveLength(12);
    const parsed = tailoredApplicationSchema.safeParse(oversizedProjectResponse);
    expect(parsed.success).toBe(false);
    expect(describeEditorialViolations(oversizedProjectResponse).join(" ")).toMatch(
      /Project bullets must be at most 6|bullets/i,
    );
  });

  it("rejects project technologies over 10", () => {
    expect(verboseCareerAppTechnologies.length).toBeGreaterThan(10);
    const parsed = tailoredApplicationSchema.safeParse({
      ...validTailoredResponse,
      projects: [
        {
          ...validTailoredResponse.projects[0]!,
          bullets: ["Designed a focused architecture for local career data"],
          technologies: [...verboseCareerAppTechnologies],
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects experience bullets over the hard schema maximum", () => {
    const eleven = Array.from({ length: 11 }, (_, i) =>
      `Delivered distinct production outcome number ${i + 1} with clear ownership`,
    );
    const parsed = tailoredApplicationSchema.safeParse({
      ...validTailoredResponse,
      experiences: [
        {
          ...validTailoredResponse.experiences[0]!,
          bullets: eleven,
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects overlong summaries", () => {
    const longSummary = Array.from({ length: 45 }, () => "word").join(" ");
    expect(wordCount(longSummary)).toBeGreaterThan(
      EDITORIAL_LIMITS.projectSummaryMaxWords,
    );
    const parsed = tailoredApplicationSchema.safeParse({
      ...validTailoredResponse,
      projects: [
        {
          ...validTailoredResponse.projects[0]!,
          summary: longSummary,
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts the compressed Career Forge evaluation fixture", () => {
    const parsed = tailoredApplicationSchema.safeParse(compressedProjectResponse);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const project = parsed.data.projects[0]!;
    expect(project.bullets.length).toBeGreaterThanOrEqual(4);
    expect(project.bullets.length).toBeLessThanOrEqual(6);
    expect(project.technologies.length).toBeLessThanOrEqual(10);
    expect(wordCount(project.summary ?? "")).toBeLessThanOrEqual(
      EDITORIAL_LIMITS.projectSummaryMaxWords,
    );
  });

  it("builds a repair prompt that demands select/merge/rewrite", () => {
    const violations = describeEditorialViolations(oversizedProjectResponse);
    const repair = buildEditorialRepairPrompt(
      "ORIGINAL USER PROMPT",
      violations,
    );
    expect(repair).toContain("ORIGINAL USER PROMPT");
    expect(repair).toMatch(/Select the strongest evidence/i);
    expect(repair).toMatch(/Do NOT merely delete the last items/i);
    expect(repair).toMatch(/never more than 6/i);
  });

  it("allows only one experience above the secondary bullet budget", () => {
    const seven = Array.from(
      { length: 7 },
      (_, i) => `Shipped distinct capability ${i + 1} with measurable production impact`,
    );
    const parsed = tailoredApplicationSchema.safeParse({
      ...validTailoredResponse,
      experiences: [
        {
          ...validTailoredResponse.experiences[0]!,
          bullets: seven,
        },
        {
          ...validTailoredResponse.experiences[1]!,
          bullets: seven,
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });
});
