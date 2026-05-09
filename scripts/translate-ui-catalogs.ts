/**
 * Translate the UI message catalogs by reading messages/en.json and
 * filling messages/{he,ar,el}.json via the configured TranslationProvider.
 *
 * Usage:
 *   DEEPL_API_KEY=... npm run translate:ui
 *
 * Without DEEPL_API_KEY the noop provider runs and the destination files
 * remain copies of en.json (which the runtime treats as "fall back to
 * source").
 *
 * Re-running is safe: the script preserves any leaf string that is
 * already different from the EN value (so manual edits aren't clobbered).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { routing } from "../i18n/routing";
import { getTranslationProvider } from "../lib/translation";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

const MESSAGES_DIR = path.join(process.cwd(), "messages");

async function readJson(p: string): Promise<Json> {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

async function writeJson(p: string, data: Json): Promise<void> {
  await fs.writeFile(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

type StringEntry = { dotPath: string; value: string };

function flattenStrings(obj: Json, base: string[] = []): StringEntry[] {
  if (typeof obj === "string") return [{ dotPath: base.join("."), value: obj }];
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return Object.entries(obj).flatMap(([k, v]) => flattenStrings(v, [...base, k]));
  }
  return [];
}

function applyTranslations(
  template: Json,
  existing: Json,
  translations: Map<string, string>,
  base: string[] = [],
): Json {
  if (typeof template === "string") {
    const dotPath = base.join(".");
    const translated = translations.get(dotPath);
    if (translated !== undefined) return translated;
    if (typeof existing === "string" && existing !== template) return existing; // preserve manual edits
    return template; // fallback to source
  }
  if (template && typeof template === "object" && !Array.isArray(template)) {
    const out: Record<string, Json> = {};
    const existingObj = (existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {}) as Record<string, Json>;
    for (const [k, v] of Object.entries(template)) {
      out[k] = applyTranslations(v, existingObj[k] ?? null, translations, [...base, k]);
    }
    return out;
  }
  return template;
}

async function main() {
  const provider = getTranslationProvider();
  console.log(`Using ${provider.name} provider`);

  const enPath = path.join(MESSAGES_DIR, "en.json");
  const en = await readJson(enPath);
  const sourceEntries = flattenStrings(en);
  console.log(`Source has ${sourceEntries.length} strings`);

  const targets = routing.locales.filter((l) => l !== routing.defaultLocale);

  for (const locale of targets) {
    const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
    let existing: Json;
    try {
      existing = await readJson(localePath);
    } catch {
      existing = {};
    }

    const sources = sourceEntries.map((e) => e.value);
    console.log(`→ ${locale}: translating ${sources.length} strings…`);
    const translated = await provider.translateBatch(sources, routing.defaultLocale, locale);

    const map = new Map<string, string>();
    sourceEntries.forEach((entry, i) => {
      const out = translated[i];
      if (out && out !== entry.value) map.set(entry.dotPath, out);
    });

    const filled = applyTranslations(en, existing, map);
    await writeJson(localePath, filled);
    console.log(`   wrote ${localePath} (${map.size} new translations)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
