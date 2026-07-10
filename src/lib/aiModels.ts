import type { AiProvider } from "@/types/ai";

export type AiModelOption = {
  id: string;
  label: string;
  provider: AiProvider;
  baseUrl: string;
  /** Hint shown under the API key field for this provider */
  keyHint: string;
};

export const DEFAULT_MODEL_ID = "gpt-4o-mini";

export const AI_MODELS: AiModelOption[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    keyHint: "OpenAI API key (sk-…)",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    keyHint: "OpenAI API key (sk-…)",
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    keyHint: "OpenAI API key (sk-…)",
  },
  {
    id: "o4-mini",
    label: "o4-mini",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    keyHint: "OpenAI API key (sk-…)",
  },
  {
    id: "claude-sonnet-4-5",
    label: "Claude Sonnet 4.5",
    provider: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    keyHint: "Anthropic API key (sk-ant-…)",
  },
  {
    id: "claude-opus-4-5",
    label: "Claude Opus 4.5",
    provider: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    keyHint: "Anthropic API key (sk-ant-…)",
  },
  {
    id: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    provider: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    keyHint: "Anthropic API key (sk-ant-…)",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    keyHint: "Google AI Studio API key",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    keyHint: "Google AI Studio API key",
  },
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B (Groq)",
    provider: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    keyHint: "Groq API key (gsk-…)",
  },
  {
    id: "llama3.2",
    label: "Llama 3.2 (Ollama)",
    provider: "ollama",
    baseUrl: "http://localhost:11434/v1",
    keyHint: "Any value works for local Ollama (e.g. ollama)",
  },
  {
    id: "mistral",
    label: "Mistral (Ollama)",
    provider: "ollama",
    baseUrl: "http://localhost:11434/v1",
    keyHint: "Any value works for local Ollama (e.g. ollama)",
  },
];

export function getModelOption(modelId: string): AiModelOption | undefined {
  return AI_MODELS.find((m) => m.id === modelId);
}

export function getDefaultModelOption(): AiModelOption {
  return getModelOption(DEFAULT_MODEL_ID) ?? AI_MODELS[0];
}
