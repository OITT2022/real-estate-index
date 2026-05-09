import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tBrand = useTranslations("brand");
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <strong>{tBrand("name")}</strong>
            <p>{t("tagline")}</p>
            <div className="footer-contact-item">
              <span>info@aradre.com</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t("quickLinks")}</h4>
            <ul>
              <li><Link href="/">{tNav("home")}</Link></li>
              <li><Link href="/projects">{tNav("projects")}</Link></li>
              <li><Link href="/about">{t("aboutUs")}</Link></li>
              <li><Link href="/contact">{tNav("contact")}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t("propertyTypes")}</h4>
            <ul>
              <li><Link href="/?propertyType=Apartment">{t("apartments")}</Link></li>
              <li><Link href="/?propertyType=House">{t("houses")}</Link></li>
              <li><Link href="/?propertyType=Villa">{t("villas")}</Link></li>
              <li><Link href="/?propertyType=Commercial">{t("commercial")}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t("support")}</h4>
            <ul>
              <li><Link href="/contact">{t("contactUs")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} {tBrand("name")}. {t("rights")}</span>
        </div>
      </div>
    </footer>
  );
}
