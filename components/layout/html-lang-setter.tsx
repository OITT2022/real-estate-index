"use client";

import { useEffect } from "react";

type Props = { locale: string; dir: "ltr" | "rtl" };

/**
 * Mutates document.documentElement.lang/dir to match the active locale.
 * Lives in app/[locale]/layout.tsx so admin pages keep their default
 * lang="en" dir="ltr" set in the root layout.
 */
export function HtmlLangSetter({ locale, dir }: Props) {
  useEffect(() => {
    const el = document.documentElement;
    if (el.lang !== locale) el.lang = locale;
    if (el.dir !== dir) el.dir = dir;
  }, [locale, dir]);
  return null;
}
