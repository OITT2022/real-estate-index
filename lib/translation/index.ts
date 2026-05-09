import type { TranslationProvider } from "./provider";
import { noopProvider } from "./noop";
import { createDeepLProvider } from "./deepl";

let cached: TranslationProvider | null = null;

/**
 * Resolves the active translation provider once per process. Picks DeepL
 * when DEEPL_API_KEY is set, otherwise the noop provider (which makes the
 * site behave like the source language for any uncached translation).
 */
export function getTranslationProvider(): TranslationProvider {
  if (cached) return cached;
  const key = process.env.DEEPL_API_KEY?.trim();
  cached = key ? createDeepLProvider(key) : noopProvider;
  return cached;
}

export type { TranslationProvider } from "./provider";
