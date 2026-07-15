import { ensureAiConfig } from "@/api/ai/bridge";
import { createLanguageModel, generateText, streamText } from "@/lib/aiClient";

type GenerateTextParams = Parameters<typeof generateText>[0];
type StreamTextParams = Parameters<typeof streamText>[0];

export type GenerateAiTextOptions = Omit<GenerateTextParams, "model">;
export type StreamAiTextOptions = Omit<StreamTextParams, "model">;

/**
 * Ensures an API key is configured (prompting via modal if needed), then
 * runs generateText against the user's selected provider/model.
 *
 * Use this from application (or other) AI helpers so key gating stays in one place.
 *
 * @example
 * ```ts
 * const { text } = await generateAiText({
 *   prompt: "Tailor this resume for the job…",
 * });
 * ```
 */
export async function generateAiText(options: GenerateAiTextOptions) {
  const config = await ensureAiConfig();
  return generateText({
    ...(options as GenerateTextParams),
    model: createLanguageModel(config),
  });
}

/**
 * Same key gate as generateAiText, then streamText.
 */
export async function streamAiText(options: StreamAiTextOptions) {
  const config = await ensureAiConfig();
  return streamText({
    ...(options as StreamTextParams),
    model: createLanguageModel(config),
  });
}
