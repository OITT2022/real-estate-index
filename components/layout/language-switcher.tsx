"use client";

import { useMemo, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import * as flagsByCode from "country-flag-icons/string/3x2";
import { routing, LOCALE_LABELS, type Locale } from "@/i18n/routing";
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";

const FLAGS = flagsByCode as Record<string, string>;

function Flag({ code, size = 16 }: { code: string; size?: number }) {
  const svg = FLAGS[code];
  if (!svg) return null;
  return (
    <span
      className="ss-flag"
      style={{ width: size * 1.5, height: size, lineHeight: 0 }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations("languageSwitcher");
  const [pending, startTransition] = useTransition();

  const options: SearchableOption[] = useMemo(
    () =>
      routing.locales.map((code) => {
        const meta = LOCALE_LABELS[code];
        return {
          value: code,
          label: meta.native,
          searchText: `${meta.native} ${meta.english} ${code}`.toLowerCase(),
        };
      }),
    [],
  );

  function switchLocale(next: string) {
    if (next === locale) return;
    // pathname includes the current locale prefix; swap it.
    // e.g. "/en/properties/foo" -> "/he/properties/foo"
    const segments = pathname.split("/");
    if (segments[1] && (routing.locales as readonly string[]).includes(segments[1])) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    const target = segments.join("/") || `/${next}`;
    startTransition(() => router.replace(target));
  }

  function renderRow(opt: SearchableOption) {
    const meta = LOCALE_LABELS[opt.value as Locale];
    return (
      <span className="ss-row">
        <Flag code={meta.flag} />
        <span className="ss-row-label">{meta.native}</span>
        <span className="ss-row-aux">{meta.english}</span>
      </span>
    );
  }

  function renderTrigger(opt: SearchableOption | null) {
    if (!opt) return <span className="ss-placeholder">{t("label")}</span>;
    const meta = LOCALE_LABELS[opt.value as Locale];
    return (
      <span className="ss-row">
        <Flag code={meta.flag} />
        <span className="ss-row-aux ss-row-aux-strong">{opt.value.toUpperCase()}</span>
      </span>
    );
  }

  return (
    <div className="lang-switcher" aria-label={t("ariaLabel")} data-pending={pending ? "true" : undefined}>
      <SearchableSelect
        compact
        options={options}
        value={locale}
        onChange={switchLocale}
        renderOption={renderRow}
        renderTrigger={renderTrigger}
        placeholder={t("label")}
      />
    </div>
  );
}
