import { HeroImageManager } from "@/components/admin/hero-image-manager";
import { getAllHeroImages } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  await checkPageAccess("homepage");
  const images = await getAllHeroImages();

  return (
    <section className="admin-content">
        <h1>Home Page</h1>
        <p className="muted">
          Manage the hero image on the right side of the homepage.
          Upload multiple images and toggle which ones are active.
          If multiple images are active, they will rotate as a slideshow.
        </p>
        <div style={{ marginTop: 20 }}>
          <HeroImageManager images={images} />
        </div>
      </section>
  );
}
