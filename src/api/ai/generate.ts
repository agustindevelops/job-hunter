import { ensureAiConfig } from "@/api/ai/bridge";
import { createLanguageModel, generateText, streamText } from "@/lib/aiClient";
import { resolveAiConfigForTier } from "@/lib/aiModels";
import type { AiModelTier } from "@/types/ai";

type GenerateTextParams = Parameters<typeof generateText>[0];
type StreamTextParams = Parameters<typeof streamText>[0];

export type GenerateAiTextOptions = Omit<GenerateTextParams, "model"> & {
  tier?: AiModelTier;
};
export type StreamAiTextOptions = Omit<StreamTextParams, "model"> & {
  tier?: AiModelTier;
};

/**
 * Ensures an API key is configured (prompting via modal if needed), then
 * runs generateText against the selected model tier (default: everyday/cheap).
 *
 * Use this from application (or other) AI helpers so key gating stays in one place.
 *
 * @example
 * ```ts
 * const { text } = await generateAiText({
 *   tier: "quality",
 *   prompt: "Tailor this resume for the job…",
 * });
 * ```
 */
export async function generateAiText(options: GenerateAiTextOptions) {
  const { tier, ...rest } = options;
  const session = await ensureAiConfig();
  const config = resolveAiConfigForTier(session, tier ?? "standard");
  return generateText({
    ...(rest as GenerateTextParams),
    model: createLanguageModel(config),
  });
}

/**
 * Same key gate as generateAiText, then streamText.
 */
export async function streamAiText(options: StreamAiTextOptions) {
  const { tier, ...rest } = options;
  const session = await ensureAiConfig();
  const config = resolveAiConfigForTier(session, tier ?? "standard");
  return streamText({
    ...(rest as StreamTextParams),
    model: createLanguageModel(config),
  });
}
