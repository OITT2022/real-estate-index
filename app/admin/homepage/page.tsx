import { HeroImageManager } from "@/components/admin/hero-image-manager";
import { getAllHeroImages } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  await checkPageAccess("homepage");
  const images = await getAllHeroImages();

  return (
    <section className="admin-content">
        <div className="at-page-header">
          <div>
            <h1 className="at-page-title">Home Page</h1>
            <p className="at-page-subtitle">Manage hero images and slideshow on the homepage</p>
          </div>
        </div>
        <HeroImageManager images={images} />
      </section>
  );
}
