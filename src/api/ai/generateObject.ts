import { ensureAiConfig } from "@/api/ai/bridge";
import { createLanguageModel } from "@/lib/aiClient";
import { resolveAiConfigForTier } from "@/lib/aiModels";
import type { AiModelTier } from "@/types/ai";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import type { z } from "zod";

export type GenerateAiObjectOptions<T> = {
  /** Zod schema used for structured generation and validation. */
  schema: z.ZodType<T>;
  prompt: string;
  system?: string;
  /**
   * Model tier: `standard` (cheap, default) or `quality` (resume + cover letter).
   */
  tier?: AiModelTier;
  /**
   * One bounded repair attempt when structured output or text fallback
   * fails schema validation. Default true.
   */
  repair?: boolean;
  /**
   * Optional custom repair prompt builder. Receives the original user prompt
   * and the failure error. Default asks for a corrected schema-valid object.
   */
  buildRepairPrompt?: (originalPrompt: string, error: unknown) => string;
};

/**
 * Provider-agnostic structured object generation.
 *
 * Primary path: AI SDK `Output.object` (schema-constrained when the provider
 * supports it). Fallback: plain text generation + balanced JSON extract +
 * Zod validation. Optionally one repair retry — never an unbounded loop.
 */
export async function generateAiObject<T>(
  options: GenerateAiObjectOptions<T>,
): Promise<T> {
  const session = await ensureAiConfig();
  const config = resolveAiConfigForTier(session, options.tier ?? "standard");
  const model = createLanguageModel(config);
  const allowRepair = options.repair !== false;

  try {
    return await generateStructured(model, options);
  } catch (firstError) {
    if (!allowRepair) throw toActionableError(firstError);

    try {
      return await generateStructured(model, {
        ...options,
        prompt: (options.buildRepairPrompt ?? defaultBuildRepairPrompt)(
          options.prompt,
          firstError,
        ),
      });
    } catch (repairError) {
      throw toActionableError(repairError, firstError);
    }
  }
}

async function generateStructured<T>(
  model: ReturnType<typeof createLanguageModel>,
  options: GenerateAiObjectOptions<T>,
): Promise<T> {
  try {
    const result = await generateText({
      model,
      system: options.system,
      prompt: options.prompt,
      output: Output.object({
        schema: options.schema,
      }),
    });

    if (result.output == null) {
      throw new Error("Model returned no structured output");
    }

    // Re-validate at the boundary — do not trust provider shaping alone.
    return parseWithSchema(options.schema, result.output);
  } catch (structuredError) {
    // Providers that struggle with constrained decoding still often return JSON text.
    if (!shouldAttemptTextFallback(structuredError)) {
      throw structuredError;
    }

    const { text } = await generateText({
      model,
      system: options.system,
      prompt: `${options.prompt}

Return ONLY a single JSON object matching the required schema. No markdown fences, no commentary.`,
    });

    const extracted = extractJsonValue(text);
    return parseWithSchema(options.schema, extracted);
  }
}

function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const details = parsed.error.issues
      .slice(0, 8)
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Structured output failed validation: ${details}`);
  }
  return parsed.data;
}

/**
 * Prefer balanced-brace extraction over greedy first-{ to last-} matching.
 * Also strips common markdown fences.
 */
export function extractJsonValue(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("AI response was empty");

  const unfenced = stripMarkdownFence(trimmed);

  try {
    return JSON.parse(unfenced);
  } catch {
    // continue to balanced extract
  }

  const start = indexOfJsonStart(unfenced);
  if (start < 0) {
    throw new Error("AI response did not contain a JSON object");
  }

  const slice = sliceBalancedJson(unfenced, start);
  try {
    return JSON.parse(slice);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `AI response JSON was malformed: ${error.message}`
        : "AI response JSON was malformed",
    );
  }
}

function stripMarkdownFence(text: string): string {
  const fence = text.match(/^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i);
  return fence ? fence[1].trim() : text;
}

function indexOfJsonStart(text: string): number {
  const obj = text.indexOf("{");
  const arr = text.indexOf("[");
  if (obj < 0) return arr;
  if (arr < 0) return obj;
  return Math.min(obj, arr);
}

function sliceBalancedJson(text: string, start: number): string {
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  throw new Error("AI response JSON was truncated or unbalanced");
}

function shouldAttemptTextFallback(error: unknown): boolean {
  if (NoObjectGeneratedError.isInstance(error)) return true;
  if (!(error instanceof Error)) return true;
  const message = error.message.toLowerCase();
  return (
    message.includes("structured") ||
    message.includes("object") ||
    message.includes("schema") ||
    message.includes("json") ||
    message.includes("output") ||
    message.includes("tool") ||
    message.includes("unsupported")
  );
}

function defaultBuildRepairPrompt(
  originalPrompt: string,
  error: unknown,
): string {
  const reason =
    error instanceof Error ? error.message : "Structured output was invalid";
  return `${originalPrompt}

PREVIOUS ATTEMPT FAILED VALIDATION.
Error: ${reason}
Return a complete, corrected JSON object that satisfies the schema.
Do not invent facts. Do not include commentary.`;
}

function toActionableError(error: unknown, previous?: unknown): Error {
  const primary =
    error instanceof Error ? error.message : "Structured generation failed";
  const prior =
    previous instanceof Error && previous.message !== primary
      ? ` (earlier: ${previous.message})`
      : "";
  return new Error(
    `Could not generate a valid tailored application. ${primary}${prior}. Try again, or switch models if this persists.`,
  );
}
