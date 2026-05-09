/**
 * Locale catalog. URL routing is intentionally NOT used in this rebuild —
 * the locale is selected via the NEXT_LOCALE cookie (see app/(public)/layout.tsx
 * once Phase C lands). This file exists only as a single source of truth
 * for the locale list, default, and RTL flag.
 */

export const LOCALES = ["en", "he", "ar", "el"] as const;
export type Locale = (typeof LOCALES)[number];

export const routing = {
  locales: LOCALES,
  defaultLocale: "en" as Locale,
} as const;

export const RTL_LOCALES: ReadonlySet<Locale> = new Set(["he", "ar"]);

export const LOCALE_LABELS: Record<Locale, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "GB" },
  he: { native: "עברית", english: "Hebrew", flag: "IL" },
  ar: { native: "العربية", english: "Arabic", flag: "SA" },
  el: { native: "Ελληνικά", english: "Greek", flag: "GR" },
};
