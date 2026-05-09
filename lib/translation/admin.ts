"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/scope";
import { routing } from "@/i18n/routing";
import { getTranslationProvider } from "./index";
import type { EntityType } from "./get";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Returns all Translation rows for the given entity grouped by locale + field.
 * Result shape: { he: { title: { value, source }, ... }, ar: {...}, ... }
 * Used by admin pages to seed the override editor.
 */
export async function getEntityTranslations(
  entityType: EntityType,
  entityId: string,
): Promise<Record<string, Record<string, { value: string; source: string }>>> {
  const rows = await db.translation.findMany({
    where: { entityType, entityId },
    select: { field: true, locale: true, value: true, source: true },
  });
  const out: Record<string, Record<string, { value: string; source: string }>> = {};
  for (const r of rows) {
    if (!out[r.locale]) out[r.locale] = {};
    out[r.locale][r.field] = { value: r.value, source: r.source };
  }
  return out;
}

const upsertSchema = z.object({
  entityType: z.enum(["property", "project", "site_setting", "ui_string"]),
  entityId: z.string().min(1),
  locale: z.string().min(2).max(8),
  fields: z.record(z.string(), z.string()),
});

/**
 * Admin override: writes one Translation row per (field, locale) with
 * source: "manual" so the auto-translator never overwrites these values.
 * Empty string deletes the row (admin clearing a field falls back to source
 * or to the next auto-translation).
 */
export async function upsertTranslations(input: unknown): Promise<ActionResult> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: "Not signed in." };

  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { entityType, entityId, locale, fields } = parsed.data;
  if (!(routing.locales as readonly string[]).includes(locale) || locale === routing.defaultLocale) {
    return { success: false, error: "Invalid locale" };
  }

  await Promise.all(
    Object.entries(fields).map(async ([field, value]) => {
      const trimmed = value.trim();
      if (!trimmed) {
        await db.translation.deleteMany({
          where: { entityType, entityId, field, locale },
        });
        return;
      }
      await db.translation.upsert({
        where: {
          entityType_entityId_field_locale: { entityType, entityId, field, locale },
        },
        create: { entityType, entityId, field, locale, value: trimmed, source: "manual" },
        update: { value: trimmed, source: "manual" },
      });
    }),
  );

  // Invalidate the public-side caches so the override is visible promptly.
  revalidatePath(`/${locale}`, "layout");
  return { success: true };
}

const autoTranslateSchema = z.object({
  entityType: z.enum(["property", "project", "site_setting", "ui_string"]),
  entityId: z.string().min(1),
  locale: z.string().min(2).max(8),
  /** field key → source text */
  sources: z.record(z.string(), z.string()),
});

/**
 * Synchronously fills missing translations via the configured provider and
 * returns a `{ field: translation }` map. Does NOT write anything — the
 * admin reviews the suggestions and presses Save.
 */
export async function autoTranslateFields(input: unknown): Promise<
  | { success: true; translations: Record<string, string> }
  | { success: false; error: string }
> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: "Not signed in." };

  const parsed = autoTranslateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { locale, sources } = parsed.data;
  if (!(routing.locales as readonly string[]).includes(locale) || locale === routing.defaultLocale) {
    return { success: false, error: "Invalid locale" };
  }

  const entries = Object.entries(sources).filter(([, v]) => Boolean(v?.trim()));
  if (entries.length === 0) return { success: true, translations: {} };

  const provider = getTranslationProvider();
  const texts = entries.map(([, v]) => v);
  let translated: string[];
  try {
    translated = await provider.translateBatch(texts, routing.defaultLocale, locale);
  } catch (err) {
    console.error("[autoTranslate] failed:", err);
    return { success: false, error: "Translation failed" };
  }

  const out: Record<string, string> = {};
  entries.forEach(([key], i) => {
    const t = translated[i];
    if (t && t !== texts[i]) out[key] = t;
  });
  return { success: true, translations: out };
}
