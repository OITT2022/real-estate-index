"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/actions";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    const result = await submitContactForm(data);
    setSending(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="inquiry-success">
        <div className="inquiry-success-icon">&#10003;</div>
        <h3>Message Sent!</h3>
        <p>Thank you for reaching out. We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-row">
        <label className="contact-form-label">
          <span>Name</span>
          <input name="name" type="text" placeholder="Your name" required className="inquiry-input" />
        </label>
        <label className="contact-form-label">
          <span>Email</span>
          <input name="email" type="email" placeholder="Your email" required className="inquiry-input" />
        </label>
      </div>
      <label className="contact-form-label">
        <span>Subject</span>
        <input name="subject" type="text" placeholder="How can we help?" required className="inquiry-input" />
      </label>
      <label className="contact-form-label">
        <span>Message</span>
        <textarea name="message" placeholder="Write your message..." rows={5} required className="inquiry-input" />
      </label>

      {error && (
        <div style={{ padding: "8px 12px", background: "#fce4ec", color: "#c62828", borderRadius: 6, fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <button type="submit" className="inquiry-submit" disabled={sending}>
        {sending ? "Sending..." : "Submit Request"}
      </button>
    </form>
  );
}
