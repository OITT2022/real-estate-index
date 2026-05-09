import type { TranslationProvider } from "./provider";

// DeepL accepts ISO 639-1 codes upper-cased; for locales it's mostly the same.
// Some locales need explicit mapping (e.g. en-US/en-GB/pt-BR/pt-PT).
function toDeepLLang(code: string): string {
  const norm = code.trim().toUpperCase();
  if (norm === "EN") return "EN-US";
  return norm;
}

type DeepLResponse = {
  translations: { detected_source_language: string; text: string }[];
};

async function callDeepL(
  texts: string[],
  source: string,
  target: string,
  apiKey: string,
  endpoint: string,
): Promise<string[]> {
  const body = new URLSearchParams();
  for (const t of texts) body.append("text", t);
  body.set("source_lang", toDeepLLang(source));
  body.set("target_lang", toDeepLLang(target));
  body.set("preserve_formatting", "1");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`DeepL ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as DeepLResponse;
  return data.translations.map((t) => t.text);
}

export function createDeepLProvider(apiKey: string): TranslationProvider {
  // DeepL routes free-tier keys to api-free.deepl.com; pro keys to api.deepl.com.
  // Free keys end with ":fx" — DeepL's documented detection rule.
  const endpoint = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  return {
    name: "deepl",
    async translate(text, source, target) {
      if (!text) return text;
      try {
        const out = await callDeepL([text], source, target, apiKey, endpoint);
        return out[0] ?? text;
      } catch (err) {
        console.error("[deepl] translate failed:", err);
        return text;
      }
    },
    async translateBatch(texts, source, target) {
      if (texts.length === 0) return [];
      // DeepL accepts up to 50 texts per call; chunk to be safe.
      const out: string[] = [];
      const CHUNK = 50;
      for (let i = 0; i < texts.length; i += CHUNK) {
        const slice = texts.slice(i, i + CHUNK);
        try {
          const got = await callDeepL(slice, source, target, apiKey, endpoint);
          out.push(...got);
        } catch (err) {
          console.error("[deepl] batch failed, falling back to inputs:", err);
          out.push(...slice);
        }
      }
      return out;
    },
  };
}
