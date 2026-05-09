import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Emit `<link rel="alternate" hreflang="…">` tags so search engines know
 * about the per-locale variants. Next.js renders `metadata.alternates`
 * automatically. The "x-default" entry tells crawlers which locale to
 * surface when no language match is found.
 */
export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `/${l}`;
  languages["x-default"] = `/${routing.defaultLocale}`;
  return { alternates: { languages } };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering inside this segment.
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </NextIntlClientProvider>
  );
}
