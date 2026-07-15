/** Thrown when the user closes the API key modal without saving. */
export class AiConfigCancelledError extends Error {
  constructor(message = "API key setup was cancelled") {
    super(message);
    this.name = "AiConfigCancelledError";
  }
}

export function isAiConfigCancelledError(
  error: unknown,
): error is AiConfigCancelledError {
  return error instanceof AiConfigCancelledError;
}
