import type { TranslationProvider } from "./provider";

/**
 * Passthrough provider — returns the input unchanged. Used when no
 * translation API key is configured so dev environments don't break.
 */
export const noopProvider: TranslationProvider = {
  name: "noop",
  async translate(text) {
    return text;
  },
  async translateBatch(texts) {
    return [...texts];
  },
};
