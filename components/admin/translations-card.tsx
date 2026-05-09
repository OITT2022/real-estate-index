"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Sparkles } from "lucide-react";
import { routing, LOCALE_LABELS, type Locale } from "@/i18n/routing";
import { upsertTranslations, autoTranslateFields } from "@/lib/translation/admin";
import type { EntityType } from "@/lib/translation/get";

export type FieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
};

type Translation = { value: string; source: string };

type Props = {
  entityType: EntityType;
  entityId: string;
  fields: FieldDef[];
  /** Source-language values, keyed by field. */
  source: Record<string, string>;
  /** Existing translations: locale → field → { value, source }. */
  existing: Record<string, Record<string, Translation>>;
  /** Optional title shown on the card. */
  title?: string;
};

const NON_DEFAULT_LOCALES = routing.locales.filter((l) => l !== routing.defaultLocale) as Locale[];

export function TranslationsCard({ entityType, entityId, fields, source, existing, title }: Props) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<Locale>(NON_DEFAULT_LOCALES[0]);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(() => {
    const seed: Record<string, Record<string, string>> = {};
    for (const locale of NON_DEFAULT_LOCALES) {
      seed[locale] = {};
      for (const f of fields) {
        seed[locale][f.key] = existing[locale]?.[f.key]?.value ?? "";
      }
    }
    return seed;
  });
  const [pending, startTransition] = useTransition();
  const [autoBusy, setAutoBusy] = useState<Locale | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const localeSummary = useMemo(() => {
    const out: Record<string, { manual: number; auto: number; total: number }> = {};
    for (const locale of NON_DEFAULT_LOCALES) {
      const rows = existing[locale] ?? {};
      let manual = 0;
      let auto = 0;
      for (const f of fields) {
        const r = rows[f.key];
        if (r?.source === "manual") manual++;
        else if (r?.source === "auto") auto++;
      }
      out[locale] = { manual, auto, total: fields.length };
    }
    return out;
  }, [existing, fields]);

  function setDraft(locale: Locale, field: string, value: string) {
    setDrafts((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  }

  async function handleAutoTranslate(locale: Locale) {
    setAutoBusy(locale);
    setErrorMsg(null);
    setStatusMsg(null);
    // Only translate fields that are currently empty in the draft.
    const sources: Record<string, string> = {};
    for (const f of fields) {
      const draft = drafts[locale][f.key];
      if (!draft && source[f.key]) sources[f.key] = source[f.key];
    }
    if (Object.keys(sources).length === 0) {
      setStatusMsg("Nothing to translate — all fields already have values.");
      setAutoBusy(null);
      return;
    }
    const res = await autoTranslateFields({ entityType, entityId, locale, sources });
    setAutoBusy(null);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    if (Object.keys(res.translations).length === 0) {
      setStatusMsg("Translation provider returned no changes (is DEEPL_API_KEY set?).");
      return;
    }
    setDrafts((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...res.translations },
    }));
    setStatusMsg(`Filled ${Object.keys(res.translations).length} field(s) — review and Save.`);
  }

  function handleSave(locale: Locale) {
    setErrorMsg(null);
    setStatusMsg(null);
    startTransition(async () => {
      const res = await upsertTranslations({
        entityType,
        entityId,
        locale,
        fields: drafts[locale],
      });
      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }
      setStatusMsg(`Saved ${LOCALE_LABELS[locale].native} translations.`);
      router.refresh();
    });
  }

  return (
    <div className="card translations-card" style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Languages size={18} className="translations-icon" />
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>{title ?? "Translations"}</p>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.85rem" }}>
            Override the auto-translated text shown to non-English visitors.
          </p>
        </div>
      </div>

      <div className="translations-tabs">
        {NON_DEFAULT_LOCALES.map((locale) => {
          const meta = LOCALE_LABELS[locale];
          const sum = localeSummary[locale];
          return (
            <button
              key={locale}
              type="button"
              onClick={() => setActiveLocale(locale)}
              className={`translations-tab ${activeLocale === locale ? "translations-tab-active" : ""}`}
            >
              <span style={{ fontWeight: 700 }}>{meta.native}</span>
              <span className="muted" style={{ fontSize: "0.78rem" }}>
                {sum.manual + sum.auto}/{sum.total} {sum.manual > 0 ? `· ${sum.manual} manual` : ""}
              </span>
            </button>
          );
        })}
      </div>

      {errorMsg && <p className="form-error">{errorMsg}</p>}
      {statusMsg && (
        <p style={{ color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: 8, margin: 0 }}>
          {statusMsg}
        </p>
      )}

      <div className="translations-fields">
        {fields.map((f) => {
          const sourceValue = source[f.key] ?? "";
          const draft = drafts[activeLocale]?.[f.key] ?? "";
          const meta = existing[activeLocale]?.[f.key];
          const InputTag = f.multiline ? "textarea" : "input";
          return (
            <div key={f.key} className="translations-field">
              <div className="translations-field-head">
                <label className="admin-label" style={{ marginBottom: 0 }}>{f.label}</label>
                {meta && (
                  <span className={`translations-badge translations-badge-${meta.source}`}>
                    {meta.source === "manual" ? "Manual" : "Auto"}
                  </span>
                )}
              </div>
              <p className="muted translations-source" title={sourceValue}>{sourceValue}</p>
              <InputTag
                value={draft}
                onChange={(e) => setDraft(activeLocale, f.key, e.target.value)}
                placeholder={`Translation in ${LOCALE_LABELS[activeLocale].native}…`}
                rows={f.multiline ? 4 : undefined}
                className="translations-input"
                dir="auto"
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          className="button-secondary"
          onClick={() => handleAutoTranslate(activeLocale)}
          disabled={autoBusy === activeLocale || pending}
        >
          <Sparkles size={14} style={{ marginRight: 4 }} />
          {autoBusy === activeLocale ? "Translating…" : "Auto-fill empty fields"}
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={() => handleSave(activeLocale)}
          disabled={pending || autoBusy === activeLocale}
        >
          {pending ? "Saving…" : `Save ${LOCALE_LABELS[activeLocale].native}`}
        </button>
        <span className="muted" style={{ fontSize: "0.8rem" }}>
          Empty fields fall back to the English source.
        </span>
      </div>
    </div>
  );
}
