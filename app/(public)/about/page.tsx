import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Real Estate Index",
  description: "Learn more about Real Estate Index, your trusted platform for premium property listings.",
};

export default function AboutPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>About Us</span>
          </div>
          <h1>About Us</h1>
          <p>Your trusted platform for premium real estate listings.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img
                src="/about-illustration.png"
                alt="Real estate analytics illustration"
              />
            </div>
            <div className="about-content">
              <p className="eyebrow">Who we are</p>
              <h2>Making Real Estate Simple &amp; Transparent</h2>
              <p>
                Real Estate Index is a premium platform built for property professionals
                and buyers who want a clean, modern experience. We make it easy to browse
                verified listings, explore developments, and connect directly with sellers.
              </p>
              <p>
                Our mission is to bring transparency and simplicity to the real estate
                market. Every listing on our platform is curated for quality, with
                comprehensive details, professional imagery, and direct contact
                information.
              </p>

              <div className="about-stats-row">
                <div className="about-stat">
                  <strong>500+</strong>
                  <span>Properties Listed</span>
                </div>
                <div className="about-stat">
                  <strong>50+</strong>
                  <span>Cities Covered</span>
                </div>
                <div className="about-stat">
                  <strong>1000+</strong>
                  <span>Happy Clients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Why choose us</p>
            <h2>What Sets Us Apart</h2>
            <p>We focus on quality over quantity, ensuring every listing meets our standards.</p>
          </div>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <div className="how-it-works-icon">&#9989;</div>
              <h3>Verified Listings</h3>
              <p>Every property is reviewed and verified before it goes live on our platform.</p>
            </div>
            <div className="how-it-works-card">
              <div className="how-it-works-icon">&#128247;</div>
              <h3>Rich Media</h3>
              <p>Professional photos, video tours, and interactive maps for every property.</p>
            </div>
            <div className="how-it-works-card">
              <div className="how-it-works-icon">&#128172;</div>
              <h3>Direct Contact</h3>
              <p>Connect directly with property sellers through our secure inquiry system.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
