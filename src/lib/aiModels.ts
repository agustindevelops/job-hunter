import type { AiProvider } from "@/types/ai";

export type AiModelOption = {
  id: string;
  label: string;
  provider: AiProvider;
  baseUrl: string;
  /** Hint shown under the API key field for this provider */
  keyHint: string;
};

export const DEFAULT_MODEL_ID = "gpt-5.6-luna";

const OPENAI = {
  provider: "openai" as const,
  baseUrl: "https://api.openai.com/v1",
  keyHint: "OpenAI API key (sk-…)",
};

const ANTHROPIC = {
  provider: "anthropic" as const,
  baseUrl: "https://api.anthropic.com/v1",
  keyHint: "Anthropic API key (sk-ant-…)",
};

const GOOGLE = {
  provider: "google" as const,
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  keyHint: "Google AI Studio API key",
};

const GROQ = {
  provider: "groq" as const,
  baseUrl: "https://api.groq.com/openai/v1",
  keyHint: "Groq API key (gsk-…)",
};

const OLLAMA = {
  provider: "ollama" as const,
  baseUrl: "http://localhost:11434/v1",
  keyHint: "Any value works for local Ollama (e.g. ollama)",
};

export const AI_MODELS: AiModelOption[] = [
  // OpenAI — GPT-5.6 family first, then strong mid/legacy options
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    ...OPENAI,
  },
  {
    id: "gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    ...OPENAI,
  },
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    ...OPENAI,
  },
  {
    id: "gpt-5.4",
    label: "GPT-5.4",
    ...OPENAI,
  },
  {
    id: "gpt-5.4-mini",
    label: "GPT-5.4 mini",
    ...OPENAI,
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    ...OPENAI,
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    ...OPENAI,
  },
  // Anthropic — current frontier + value tiers
  {
    id: "claude-fable-5",
    label: "Claude Fable 5",
    ...ANTHROPIC,
  },
  {
    id: "claude-opus-4-8",
    label: "Claude Opus 4.8",
    ...ANTHROPIC,
  },
  {
    id: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    ...ANTHROPIC,
  },
  {
    id: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    ...ANTHROPIC,
  },
  // Google — Gemini 3.x + proven 2.5
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    ...GOOGLE,
  },
  {
    id: "gemini-3.1-pro",
    label: "Gemini 3.1 Pro",
    ...GOOGLE,
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    ...GOOGLE,
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    ...GOOGLE,
  },
  // Groq — fast open models
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B (Groq)",
    ...GROQ,
  },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    label: "Llama 4 Scout (Groq)",
    ...GROQ,
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B (Groq)",
    ...GROQ,
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B Instant (Groq)",
    ...GROQ,
  },
  // Ollama — local
  {
    id: "llama3.2",
    label: "Llama 3.2 (Ollama)",
    ...OLLAMA,
  },
  {
    id: "mistral",
    label: "Mistral (Ollama)",
    ...OLLAMA,
  },
  {
    id: "qwen2.5",
    label: "Qwen 2.5 (Ollama)",
    ...OLLAMA,
  },
  {
    id: "gemma3",
    label: "Gemma 3 (Ollama)",
    ...OLLAMA,
  },
];

export function getModelOption(modelId: string): AiModelOption | undefined {
  return AI_MODELS.find((m) => m.id === modelId);
}

export function getDefaultModelOption(): AiModelOption {
  return getModelOption(DEFAULT_MODEL_ID) ?? AI_MODELS[0];
}
