import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

/**
 * next-intl resolver invoked by createNextIntlPlugin. Reads the
 * NEXT_LOCALE cookie. Cookie missing or invalid → falls back to the
 * default locale. Wrapped in try/catch so a serverless-runtime hiccup
 * never propagates as a 500 from this layer.
 */
export default getRequestConfig(async () => {
  let locale: Locale = routing.defaultLocale;
  try {
    const c = await cookies();
    const v = c.get("NEXT_LOCALE")?.value;
    if (v && (routing.locales as readonly string[]).includes(v)) {
      locale = v as Locale;
    }
  } catch {
    // ignore — keep defaultLocale
  }

  let messages: Record<string, unknown> = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    // Empty catalog is fine — components fall back to t() keys when missing.
  }

  return { locale, messages };
});
