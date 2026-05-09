import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAboutContent } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const c = await getAboutContent();

  return (
    <main>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumb">
            <Link href="/">{tNav("home")}</Link>
            <span>/</span>
            <span>{c.about_title}</span>
          </div>
          <h1>{c.about_title}</h1>
          <p>{c.about_subtitle}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img
                src={c.about_image}
                alt="Real estate analytics illustration"
              />
            </div>
            <div className="about-content">
              <p className="eyebrow">{c.about_eyebrow}</p>
              <h2>{c.about_heading}</h2>
              <p>{c.about_text1}</p>
              <p>{c.about_text2}</p>

              <div className="about-stats-row">
                <div className="about-stat">
                  <strong>{c.about_stat1_value}</strong>
                  <span>{c.about_stat1_label}</span>
                </div>
                <div className="about-stat">
                  <strong>{c.about_stat2_value}</strong>
                  <span>{c.about_stat2_label}</span>
                </div>
                <div className="about-stat">
                  <strong>{c.about_stat3_value}</strong>
                  <span>{c.about_stat3_label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">{c.about_section2_eyebrow}</p>
            <h2>{c.about_section2_heading}</h2>
            <p>{c.about_section2_intro}</p>
          </div>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <div className="how-it-works-icon">&#9989;</div>
              <h3>{c.about_card1_title}</h3>
              <p>{c.about_card1_text}</p>
            </div>
            <div className="how-it-works-card">
              <div className="how-it-works-icon">&#128247;</div>
              <h3>{c.about_card2_title}</h3>
              <p>{c.about_card2_text}</p>
            </div>
            <div className="how-it-works-card">
              <div className="how-it-works-icon">&#128172;</div>
              <h3>{c.about_card3_title}</h3>
              <p>{c.about_card3_text}</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
