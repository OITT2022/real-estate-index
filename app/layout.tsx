import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The actual lang/dir for public routes is updated client-side by
  // <HtmlLangSetter /> inside app/[locale]/layout.tsx. Admin routes are
  // English-only so the default here is correct for them.
  return (
    <html lang="en" dir="ltr">
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
