import { AiConfigCancelledError } from "@/api/ai/errors";
import type { AiConfig } from "@/types/ai";

type AiConfigBridge = {
  getConfig: () => AiConfig | null;
  /** Opens the API key modal and resolves with the saved config (or rejects on cancel). */
  promptForConfig: () => Promise<AiConfig>;
};

let bridge: AiConfigBridge | null = null;

/** Called by AiConfigProvider so non-React API code can read/prompt for config. */
export function registerAiConfigBridge(next: AiConfigBridge): void {
  bridge = next;
}

export function unregisterAiConfigBridge(): void {
  bridge = null;
}

/**
 * Returns the in-memory AI config, prompting via modal when missing.
 * Rejects with AiConfigCancelledError if the user closes without saving.
 */
export async function ensureAiConfig(): Promise<AiConfig> {
  if (!bridge) {
    throw new Error(
      "AI config provider is not mounted. Wrap the app in AiConfigProvider.",
    );
  }

  const existing = bridge.getConfig();
  if (existing) return existing;

  return bridge.promptForConfig();
}

export { AiConfigCancelledError };
