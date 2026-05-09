import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-mark">
          <img src="/Favicon/android-chrome-192x192.png" alt={tBrand("name")} className="brand-logo" />
          {tBrand("name")}
        </Link>
        <nav className="top-nav">
          <Link href="/">{t("home")}</Link>
          <Link href="/projects">{t("projects")}</Link>
          <Link href="/map">{t("map")}</Link>
          <Link href="/about">{t("about")}</Link>
          <Link href="/contact">{t("contact")}</Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
