export type TimezoneOption = {
  /** IANA timezone id (e.g. "Asia/Jerusalem") */
  value: string;
  /** Windows-style label (e.g. "(UTC+02:00) Jerusalem") */
  label: string;
  /** Numeric offset in minutes — used for sorting */
  offsetMinutes: number;
};

let cached: TimezoneOption[] | null = null;

function getOffsetMinutes(tz: string, ref: Date): number {
  // Use formatToParts with longOffset to get a stable "GMT±HH:MM" string.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "longOffset",
  }).formatToParts(ref);
  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  const m = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  const hh = Number(m[2]);
  const mm = Number(m[3] ?? 0);
  return sign * (hh * 60 + mm);
}

function formatOffset(min: number): string {
  const sign = min >= 0 ? "+" : "-";
  const abs = Math.abs(min);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

function friendlyCity(tz: string): string {
  const tail = tz.split("/").pop() ?? tz;
  return tail.replace(/_/g, " ");
}

export function listTimezones(): TimezoneOption[] {
  if (cached) return cached;
  const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
  const ids = typeof intl.supportedValuesOf === "function"
    ? intl.supportedValuesOf("timeZone")
    : ["UTC"];
  const ref = new Date();
  const out: TimezoneOption[] = ids.map((tz) => {
    const offsetMinutes = getOffsetMinutes(tz, ref);
    return {
      value: tz,
      label: `(${formatOffset(offsetMinutes)}) ${friendlyCity(tz)}`,
      offsetMinutes,
    };
  });
  // Sort by offset ascending, then alphabetically — matches Windows OS picker.
  out.sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.value.localeCompare(b.value));
  cached = out;
  return out;
}
