import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText, type LanguageModel } from "ai";
import type { AiConfig } from "@/types/ai";

/**
 * Builds a LanguageModel from the in-memory client config.
 * Safe to call from the browser — keys stay in memory and are sent only to the
 * provider base URL the user configured.
 *
 * @example
 * ```ts
 * import { generateText } from "ai";
 * import { createLanguageModel } from "@/lib/aiClient";
 * import { useAiConfig } from "@/context/AiConfigContext";
 *
 * const { config } = useAiConfig();
 * if (!config) throw new Error("Missing AI config");
 *
 * const { text } = await generateText({
 *   model: createLanguageModel(config),
 *   prompt: "Summarize this job posting…",
 * });
 * ```
 */
export function createLanguageModel(config: AiConfig): LanguageModel {
  const { apiKey, model, provider, baseUrl } = config;

  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey,
        baseURL: baseUrl,
      })(model);

    case "anthropic":
      return createAnthropic({
        apiKey,
        baseURL: baseUrl,
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
        },
      })(model);

    case "google":
      return createGoogleGenerativeAI({
        apiKey,
        baseURL: baseUrl,
      })(model);

    case "groq":
    case "ollama":
      return createOpenAI({
        apiKey: apiKey || "ollama",
        baseURL: baseUrl,
        name: provider,
      })(model);

    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unsupported provider: ${_exhaustive}`);
    }
  }
}

export { generateText, streamText };
