export type AiProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "ollama";

export type AiConfig = {
  apiKey: string;
  model: string;
  provider: AiProvider;
  /** Provider API base URL (auto-filled from model; editable for custom/local endpoints). */
  baseUrl: string;
};
