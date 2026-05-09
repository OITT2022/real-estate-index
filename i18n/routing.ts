/**
 * Locale catalog. Pure data — no Next.js imports here. URL routing is
 * intentionally NOT used; locale comes from the NEXT_LOCALE cookie.
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
