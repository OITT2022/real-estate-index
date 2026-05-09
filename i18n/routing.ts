import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "he", "ar", "el"] as const,
  defaultLocale: "en",
  // Always show the locale prefix so URLs are explicit and SEO-clean.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const RTL_LOCALES: ReadonlySet<Locale> = new Set(["he", "ar"]);

export const LOCALE_LABELS: Record<Locale, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "GB" },
  he: { native: "עברית", english: "Hebrew", flag: "IL" },
  ar: { native: "العربية", english: "Arabic", flag: "SA" },
  el: { native: "Ελληνικά", english: "Greek", flag: "GR" },
};
