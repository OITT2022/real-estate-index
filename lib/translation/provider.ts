export interface TranslationProvider {
  /** Translates a single string. Returns the input on failure. */
  translate(text: string, source: string, target: string): Promise<string>;
  /**
   * Translates many strings in one call when the provider supports it.
   * Default implementation falls back to N parallel `translate` calls.
   */
  translateBatch(texts: string[], source: string, target: string): Promise<string[]>;
  /** Human-readable name for logging. */
  readonly name: string;
}
