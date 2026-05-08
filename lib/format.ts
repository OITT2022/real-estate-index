const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  ILS: "₪",
  GBP: "£",
};

function symbolFor(currency: string): string {
  const key = currency.toUpperCase();
  return CURRENCY_SYMBOLS[key] ?? `${key} `;
}

function trimZeros(n: string): string {
  return n.replace(/\.?0+$/, "");
}

export function formatCompactPrice(value: number, currency: string = "EUR"): string {
  if (!Number.isFinite(value) || value <= 0) return `${symbolFor(currency)}—`;
  const symbol = symbolFor(currency);
  if (value >= 1_000_000) return `${symbol}${trimZeros((value / 1_000_000).toFixed(2))}M`;
  if (value >= 10_000) return `${symbol}${Math.round(value / 1_000)}K`;
  return `${symbol}${value.toLocaleString()}`;
}
