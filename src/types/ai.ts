export type AiProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "ollama";

/** Which model tier to use for a request. */
export type AiModelTier = "standard" | "quality";

export type AiConfig = {
  apiKey: string;
  /** Everyday / cheaper model (job parse, fit scoring, profile dump). */
  model: string;
  /** Higher-quality model for resume + cover letter generation. */
  qualityModel: string;
  /** Provider for the everyday model (drives key hint + default base URL). */
  provider: AiProvider;
  /** Provider API base URL (auto-filled from everyday model; editable). */
  baseUrl: string;
};
