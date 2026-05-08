let cached: string[] | null = null;

export function listTimezones(): string[] {
  if (cached) return cached;
  // Intl.supportedValuesOf is available in Node 18+ and modern browsers.
  // Fall back to a small curated list if the runtime is too old.
  const fallback = [
    "UTC",
    "Europe/London",
    "Europe/Nicosia",
    "Europe/Paris",
    "Asia/Jerusalem",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "America/New_York",
    "America/Los_Angeles",
  ];
  const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
  const list = typeof intl.supportedValuesOf === "function"
    ? intl.supportedValuesOf("timeZone")
    : fallback;
  cached = [...list].sort();
  return cached;
}
