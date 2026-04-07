import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact Us — Real Estate Index",
  description: "Get in touch with our team. We are here to help you find your perfect property.",
};

export default function ContactPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Contact</span>
          </div>
          <h1>Contact Us</h1>
          <p>We&apos;d love to hear from you. Get in touch with our team.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* ── Contact Form ──────────────────────────────── */}
            <div className="contact-form-card">
              <h2 className="contact-form-title">Send Us a Message</h2>
              <p className="muted" style={{ margin: "0 0 24px" }}>
                Fill in the form below and we&apos;ll get back to you as soon as possible.
              </p>
              <ContactForm />
            </div>

            {/* ── Info Cards ───────────────────────────────── */}
            <div className="contact-info-col">
              <div className="contact-info-intro">
                <h2>Get In Touch</h2>
                <p className="muted">
                  Whether you have a question about listings, pricing, or anything else,
                  our team is ready to answer all your questions.
                </p>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4>Our Office</h4>
                  <p>Cyprus</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <Mail size={22} />
                </div>
                <div>
                  <h4>Email Us</h4>
                  <p>info@aradre.com</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <Phone size={22} />
                </div>
                <div>
                  <h4>Call Us</h4>
                  <p>+357 99 123 456</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <Image
                  src="/contact-illustration.png"
                  alt="Contact us"
                  width={220}
                  height={220}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
