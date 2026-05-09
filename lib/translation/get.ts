import { after } from "next/server";
import { db } from "@/lib/db";
import { routing, type Locale } from "@/i18n/routing";
import { getTranslationProvider } from "./index";

const SOURCE_LOCALE: Locale = routing.defaultLocale;

export type EntityType = "property" | "project" | "site_setting" | "ui_string";

type FieldRequest = {
  entityType: EntityType;
  entityId: string;
  field: string;
  /** Source-language text (used as fallback + as the input for the API). */
  sourceText: string;
};

/**
 * Returns the translation for a single field. If a row exists in the
 * Translation table it's returned synchronously. Otherwise the source text
 * is returned and a background translation job is enqueued via `after()`.
 *
 * Never throws. Falls back to sourceText on any DB error.
 */
export async function getTranslatedField(
  req: FieldRequest,
  locale: string,
): Promise<string> {
  if (!req.sourceText || locale === SOURCE_LOCALE) return req.sourceText;
  if (!isSupportedLocale(locale)) return req.sourceText;

  try {
    const row = await db.translation.findUnique({
      where: {
        entityType_entityId_field_locale: {
          entityType: req.entityType,
          entityId: req.entityId,
          field: req.field,
          locale,
        },
      },
      select: { value: true },
    });
    if (row) return row.value;
  } catch (err) {
    console.error("[translation] lookup failed:", err);
    return req.sourceText;
  }

  // Cache miss → return source synchronously, fill the cache after response.
  scheduleTranslate([req], locale);
  return req.sourceText;
}

/**
 * Batched lookup. Pass an object → field-map and get back the same object
 * shape with translatable fields replaced by their translations (or the
 * source value if not yet cached). Avoids N+1 by issuing a single
 * `findMany` per call.
 */
export async function getTranslatedFields<T extends Record<string, unknown>>(
  entity: T,
  args: {
    entityType: EntityType;
    entityId: string;
    fields: readonly (keyof T & string)[];
  },
  locale: string,
): Promise<T> {
  if (locale === SOURCE_LOCALE || !isSupportedLocale(locale)) return entity;

  const requests: FieldRequest[] = [];
  for (const field of args.fields) {
    const sourceText = entity[field];
    if (typeof sourceText === "string" && sourceText) {
      requests.push({ entityType: args.entityType, entityId: args.entityId, field, sourceText });
    }
  }
  if (requests.length === 0) return entity;

  let rows: { field: string; value: string }[] = [];
  try {
    rows = await db.translation.findMany({
      where: {
        entityType: args.entityType,
        entityId: args.entityId,
        locale,
        field: { in: requests.map((r) => r.field) },
      },
      select: { field: true, value: true },
    });
  } catch (err) {
    console.error("[translation] batch lookup failed:", err);
    return entity;
  }

  const cached = new Map(rows.map((r) => [r.field, r.value]));
  const next: Record<string, unknown> = { ...entity };
  const missing: FieldRequest[] = [];
  for (const r of requests) {
    const v = cached.get(r.field);
    if (v !== undefined) {
      next[r.field] = v;
    } else {
      missing.push(r);
    }
  }

  if (missing.length > 0) scheduleTranslate(missing, locale);
  return next as T;
}

function isSupportedLocale(locale: string): boolean {
  return (routing.locales as readonly string[]).includes(locale);
}

/**
 * Fire-and-forget. Uses Next.js `after()` so the response is sent before
 * we hit the translation API, then writes one row per (field, locale).
 *
 * `upsert` keeps two parallel cache misses idempotent — the second writer
 * sees a duplicate-key conflict and updates the same row.
 */
function scheduleTranslate(requests: FieldRequest[], locale: string) {
  try {
    after(async () => {
      const provider = getTranslationProvider();
      const sources = requests.map((r) => r.sourceText);
      let translated: string[];
      try {
        translated = await provider.translateBatch(sources, SOURCE_LOCALE, locale);
      } catch (err) {
        console.error(`[translation] ${provider.name} batch failed:`, err);
        return;
      }

      // Skip rows where the provider returned the input verbatim — that
      // means it was a noop or a failure. Don't pollute the cache with
      // "translations" that would prevent a real one from being written
      // later when DEEPL_API_KEY is added.
      await Promise.all(
        requests.map(async (r, i) => {
          const value = translated[i];
          if (!value || value === r.sourceText) return;
          try {
            // Read first so we can preserve manual overrides. Two parallel
            // misses are still safe: the unique index makes the second
            // writer's upsert a no-op on the same row.
            const existing = await db.translation.findUnique({
              where: {
                entityType_entityId_field_locale: {
                  entityType: r.entityType,
                  entityId: r.entityId,
                  field: r.field,
                  locale,
                },
              },
              select: { source: true },
            });
            if (existing?.source === "manual") return;
            await db.translation.upsert({
              where: {
                entityType_entityId_field_locale: {
                  entityType: r.entityType,
                  entityId: r.entityId,
                  field: r.field,
                  locale,
                },
              },
              create: {
                entityType: r.entityType,
                entityId: r.entityId,
                field: r.field,
                locale,
                value,
                source: "auto",
              },
              update: { value, source: "auto" },
            });
          } catch (err) {
            console.error("[translation] upsert failed:", err);
          }
        }),
      );
    });
  } catch (err) {
    // `after()` only works inside a request context; callers from scripts
    // or unit tests will hit this branch — silently skip.
    console.warn("[translation] after() unavailable, skipping background fill");
  }
}
