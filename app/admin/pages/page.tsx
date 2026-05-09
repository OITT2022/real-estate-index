import { HeroImageManager } from "@/components/admin/hero-image-manager";
import { AboutPageEditor } from "@/components/admin/about-page-editor";
import { ContactPageEditor } from "@/components/admin/contact-page-editor";
import { HomepageContentEditor } from "@/components/admin/homepage-content-editor";
import { TranslationsCard, type FieldDef } from "@/components/admin/translations-card";
import { getAllHeroImages } from "@/lib/site-data";
import { getAboutContent, getContactContent, getHomepageContent } from "@/lib/settings";
import { checkPageAccess } from "@/lib/check-access";
import { getEntityTranslations } from "@/lib/translation/admin";
import { PagesTabs } from "@/components/admin/pages-tabs";

export const dynamic = "force-dynamic";

const NON_TRANSLATABLE_KEYS = new Set([
  "about_image",
  "about_stat1_value",
  "about_stat2_value",
  "about_stat3_value",
  "contact_image",
  "contact_email",
  "contact_phone",
]);

function humanLabel(key: string): string {
  return key
    .replace(/^[a-z]+_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildFields(content: Record<string, string>): FieldDef[] {
  return Object.keys(content)
    .filter((k) => !NON_TRANSLATABLE_KEYS.has(k))
    .map((k) => ({
      key: k,
      label: humanLabel(k),
      multiline: (content[k]?.length ?? 0) > 80,
    }));
}

function buildSource(content: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(content)) {
    if (!NON_TRANSLATABLE_KEYS.has(k)) out[k] = v;
  }
  return out;
}

export default async function AdminPagesPage() {
  await checkPageAccess("homepage");
  const [images, aboutContent, contactContent, homepageContent] = await Promise.all([
    getAllHeroImages(),
    getAboutContent(),
    getContactContent(),
    getHomepageContent(),
  ]);

  const [aboutTranslations, contactTranslations, homepageTranslations] = await Promise.all([
    getEntityTranslations("site_setting", "about"),
    getEntityTranslations("site_setting", "contact"),
    getEntityTranslations("site_setting", "homepage"),
  ]);

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Pages</h1>
          <p className="at-page-subtitle">Manage public page content — Homepage, About, and Contact</p>
        </div>
      </div>
      <PagesTabs
        homepageContent={
          <div style={{ display: "grid", gap: 20 }}>
            <HeroImageManager images={images} />
            <HomepageContentEditor content={homepageContent} />
            <TranslationsCard
              entityType="site_setting"
              entityId="homepage"
              fields={buildFields(homepageContent)}
              source={buildSource(homepageContent)}
              existing={homepageTranslations}
              title="Homepage translations"
            />
          </div>
        }
        aboutContent={
          <div style={{ display: "grid", gap: 20 }}>
            <AboutPageEditor content={aboutContent} />
            <TranslationsCard
              entityType="site_setting"
              entityId="about"
              fields={buildFields(aboutContent)}
              source={buildSource(aboutContent)}
              existing={aboutTranslations}
              title="About translations"
            />
          </div>
        }
        contactContent={
          <div style={{ display: "grid", gap: 20 }}>
            <ContactPageEditor content={contactContent} />
            <TranslationsCard
              entityType="site_setting"
              entityId="contact"
              fields={buildFields(contactContent)}
              source={buildSource(contactContent)}
              existing={contactTranslations}
              title="Contact translations"
            />
          </div>
        }
      />
    </section>
  );
}
