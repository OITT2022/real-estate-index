import { HeroImageManager } from "@/components/admin/hero-image-manager";
import { AboutPageEditor } from "@/components/admin/about-page-editor";
import { ContactPageEditor } from "@/components/admin/contact-page-editor";
import { getAllHeroImages } from "@/lib/site-data";
import { getAboutContent, getContactContent } from "@/lib/settings";
import { checkPageAccess } from "@/lib/check-access";
import { PagesTabs } from "@/components/admin/pages-tabs";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  await checkPageAccess("homepage");
  const [images, aboutContent, contactContent] = await Promise.all([
    getAllHeroImages(),
    getAboutContent(),
    getContactContent(),
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
        homepageContent={<HeroImageManager images={images} />}
        aboutContent={<AboutPageEditor content={aboutContent} />}
        contactContent={<ContactPageEditor content={contactContent} />}
      />
    </section>
  );
}
