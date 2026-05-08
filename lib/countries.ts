import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

export type CountryOption = {
  /** ISO-3166 alpha-2 (e.g. "CY", "IL", "US") */
  code: string;
  /** Localized country display name */
  name: string;
  /** Calling code without the "+" (e.g. "357", "972", "1") */
  dialCode: string;
};

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

let cached: CountryOption[] | null = null;

export function listCountries(): CountryOption[] {
  if (cached) return cached;
  const out: CountryOption[] = [];
  for (const code of getCountries()) {
    let dialCode: string;
    try {
      dialCode = getCountryCallingCode(code);
    } catch {
      continue;
    }
    const name = displayNames.of(code) ?? code;
    out.push({ code, name, dialCode });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  cached = out;
  return out;
}

export function dialCodeFor(country: string): string | null {
  if (!country) return null;
  try {
    return getCountryCallingCode(country as Parameters<typeof getCountryCallingCode>[0]);
  } catch {
    return null;
  }
}
