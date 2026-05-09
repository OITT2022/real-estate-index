import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import { routing, RTL_LOCALES, type Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Real Estate Index",
  description: "Browse premium real estate listings with property details, galleries, and direct seller contact.",
  icons: {
    icon: [
      { url: "/Favicon/favicon.ico", sizes: "any" },
      { url: "/Favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/Favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/Favicon/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // next-intl middleware writes NEXT_LOCALE on the locale routes; admin and
  // other non-localized routes get the default. Reading the cookie keeps the
  // root layout valid for both branches without needing per-segment params.
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
  const locale: Locale = cookieLocale && (routing.locales as readonly string[]).includes(cookieLocale)
    ? cookieLocale
    : routing.defaultLocale;
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
