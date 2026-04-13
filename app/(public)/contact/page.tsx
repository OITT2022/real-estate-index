import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { getContactContent } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us — Real Estate Index",
  description: "Get in touch with our team. We are here to help you find your perfect property.",
};

export default async function ContactPage() {
  const c = await getContactContent();

  return (
    <main>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>{c.contact_title}</span>
          </div>
          <h1>{c.contact_title}</h1>
          <p>{c.contact_subtitle}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* ── Contact Form ──────────────────────────────── */}
            <div className="contact-form-card">
              <h2 className="contact-form-title">{c.contact_form_heading}</h2>
              <p className="muted" style={{ margin: "0 0 24px" }}>
                {c.contact_form_intro}
              </p>
              <ContactForm />
            </div>

            {/* ── Info Cards ───────────────────────────────── */}
            <div className="contact-info-col">
              <div className="contact-info-intro">
                <h2>{c.contact_info_heading}</h2>
                <p className="muted">{c.contact_info_intro}</p>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4>Our Office</h4>
                  <p>{c.contact_office}</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <Mail size={22} />
                </div>
                <div>
                  <h4>Email Us</h4>
                  <p>{c.contact_email}</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <Phone size={22} />
                </div>
                <div>
                  <h4>Call Us</h4>
                  <p>{c.contact_phone}</p>
                </div>
              </div>

              {c.contact_image && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                  <img
                    src={c.contact_image}
                    alt="Contact us"
                    width={220}
                    height={220}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
