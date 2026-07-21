import {
  AI_MODELS,
  DEFAULT_MODEL_ID,
  getModelOption,
  type AiModelOption,
} from "@/lib/aiModels";
import type { AiConfig } from "@/types/ai";

/**
 * Optional local defaults from Next.js public env (`.env` / `.env.local`).
 * These are inlined into the client bundle at build/dev time — use only for
 * local development; do not commit real keys.
 *
 * - NEXT_PUBLIC_AI_API_KEY — provider API key (or any value for Ollama)
 * - NEXT_PUBLIC_AI_MODEL — model id (e.g. gpt-4o-mini, llama3.2)
 * - NEXT_PUBLIC_AI_BASE_URL — optional base URL override
 */
export function getEnvAiApiKey(): string {
  return process.env.NEXT_PUBLIC_AI_API_KEY?.trim() ?? "";
}

export function getEnvAiModelId(): string {
  return process.env.NEXT_PUBLIC_AI_MODEL?.trim() ?? "";
}

export function getEnvAiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_AI_BASE_URL?.trim().replace(/\/$/, "") ?? "";
}

function resolveModelOption(modelId: string): AiModelOption {
  const known = getModelOption(modelId);
  if (known) return known;

  const fallback =
    getModelOption(DEFAULT_MODEL_ID) ?? AI_MODELS[0]!;
  return {
    id: modelId,
    label: modelId,
    provider: fallback.provider,
    baseUrl: fallback.baseUrl,
    keyHint: fallback.keyHint,
  };
}

/** Starting model for the API key modal — env model first, else app default. */
export function getStartingModelOption(): AiModelOption {
  const envModel = getEnvAiModelId();
  if (envModel) return resolveModelOption(envModel);
  return getModelOption(DEFAULT_MODEL_ID) ?? AI_MODELS[0]!;
}

/**
 * Full AI config from env when a key (or Ollama) is available.
 * Returns null when env cannot seed a usable session config.
 */
export function getAiConfigFromEnv(): AiConfig | null {
  const envKey = getEnvAiApiKey();
  const envModel = getEnvAiModelId();
  const envBaseUrl = getEnvAiBaseUrl();

  if (!envKey && !envModel) return null;

  const option = envModel
    ? resolveModelOption(envModel)
    : (getModelOption(DEFAULT_MODEL_ID) ?? AI_MODELS[0]!);

  const apiKey =
    envKey || (option.provider === "ollama" ? "ollama" : "");
  if (!apiKey) return null;

  return {
    apiKey,
    model: option.id,
    provider: option.provider,
    baseUrl: envBaseUrl || option.baseUrl,
  };
}
