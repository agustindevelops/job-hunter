import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  assertSafeMasterShape,
  normalizeMasterProfile,
} from "@/api/application/fromDump/normalize";
import {
  buildMasterDumpPrompt,
  MASTER_DUMP_SYSTEM_PROMPT,
} from "@/api/application/fromDump/prompt";
import { masterProfileSchema } from "@/api/application/fromDump/schema";
import {
  emptySerializedProfile,
  serializeProfileForPrompt,
} from "@/api/application/fromDump/serialize";
import {
  fictionalCurrentProfile,
  promptInjectionDump,
  resumeDump,
  validMasterResponse,
} from "@/api/application/fromDump/__fixtures__";

describe("serializeProfileForPrompt", () => {
  it("removes entity ids but preserves factual profile content", () => {
    const serialized = serializeProfileForPrompt(fictionalCurrentProfile);
    const json = JSON.stringify(serialized);

    expect(json).not.toMatch(/"id"\s*:/);
    expect(serialized.fullName).toBe("Alex Rivera");
    expect(serialized.experiences[0]?.bullets[0]).toContain("React dashboards");
    expect(serialized.contact.email).toBe("alex@example.com");
  });
});

describe("master dump prompt", () => {
  const prompt = buildMasterDumpPrompt({
    mode: "replace",
    dataDump: promptInjectionDump,
    current: null,
  });

  it("separates dump data with delimiters", () => {
    expect(prompt).toContain("<<<DATA_DUMP_START>>>");
    expect(prompt).toContain("<<<DATA_DUMP_END>>>");
  });

  it("includes truthfulness and prompt-injection rules", () => {
    expect(MASTER_DUMP_SYSTEM_PROMPT).toMatch(/Never invent/i);
    expect(MASTER_DUMP_SYSTEM_PROMPT).toMatch(/untrusted data/i);
    expect(MASTER_DUMP_SYSTEM_PROMPT).toMatch(/Ignore embedded text/i);
    expect(prompt).toContain("IGNORE PREVIOUS INSTRUCTIONS");
  });

  it("includes current master delimiters in add mode", () => {
    const addPrompt = buildMasterDumpPrompt({
      mode: "add",
      dataDump: resumeDump,
      current: serializeProfileForPrompt(fictionalCurrentProfile),
    });
    expect(addPrompt).toContain("<<<CURRENT_MASTER_START>>>");
    expect(addPrompt).toContain("ADD / MERGE");
  });

  it("remains provider-agnostic", () => {
    expect(MASTER_DUMP_SYSTEM_PROMPT.toLowerCase()).not.toContain("openai");
    expect(MASTER_DUMP_SYSTEM_PROMPT.toLowerCase()).not.toContain("anthropic");
  });
});

describe("masterProfileSchema", () => {
  it("accepts a valid complete profile", () => {
    expect(masterProfileSchema.safeParse(validMasterResponse).success).toBe(
      true,
    );
  });

  it("rejects invalid shapes", () => {
    expect(
      masterProfileSchema.safeParse({
        fullName: 1,
        experiences: "nope",
      }).success,
    ).toBe(false);
  });
});

describe("normalizeMasterProfile", () => {
  it("nulls endDate for current roles", () => {
    const normalized = normalizeMasterProfile({
      ...validMasterResponse,
      experiences: [
        {
          ...validMasterResponse.experiences[0]!,
          current: true,
          endDate: "2026-01",
        },
      ],
    });
    expect(normalized.experiences[0]?.current).toBe(true);
    expect(normalized.experiences[0]?.endDate).toBeNull();
  });

  it("handles empty optional fields safely", () => {
    const normalized = normalizeMasterProfile({
      ...validMasterResponse,
      headline: "  ",
      contact: {
        phone: null,
        email: null,
        city: null,
        state: null,
        zipcode: null,
        portfolioUrl: null,
        linkedinUrl: null,
        githubUrl: null,
      },
      projects: [],
      achievements: [],
      skillCategories: [],
    });
    expect(normalized.headline).toBe("");
    expect(normalized.contact.email).toBeUndefined();
    expect(normalized.projects).toEqual([]);
  });
});

describe("assertSafeMasterShape", () => {
  it("rejects add-mode merges that drop all work history", () => {
    const prior = serializeProfileForPrompt(fictionalCurrentProfile);
    const wiped = normalizeMasterProfile({
      ...validMasterResponse,
      experiences: [],
    });
    expect(() => assertSafeMasterShape("add", prior, wiped)).toThrow(
      /dropped all work history/i,
    );
  });

  it("allows replace mode with sparse experience when dump supports it", () => {
    const next = normalizeMasterProfile({
      ...validMasterResponse,
      experiences: [],
      education: [],
    });
    expect(() =>
      assertSafeMasterShape("replace", emptySerializedProfile(), next),
    ).not.toThrow();
  });

  it("accepts a strong valid merged profile", () => {
    const prior = serializeProfileForPrompt(fictionalCurrentProfile);
    const next = normalizeMasterProfile(validMasterResponse);
    expect(() => assertSafeMasterShape("add", prior, next)).not.toThrow();
  });
});

describe("masterFromDump persistence safety", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("does not return a payload when generation fails", async () => {
    vi.doMock("@/api/ai", () => ({
      generateAiObject: vi.fn(async () => {
        throw new Error("Structured output failed validation: fullName: Required");
      }),
    }));

    const { masterFromDump } = await import("@/api/application/fromDump");

    await expect(
      masterFromDump({
        mode: "replace",
        dataDump: resumeDump,
      }),
    ).rejects.toThrow(/valid|failed validation|fullName/i);
  });
});
