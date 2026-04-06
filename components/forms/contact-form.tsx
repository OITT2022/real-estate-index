"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
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
          <input type="text" placeholder="Your name" required className="inquiry-input" />
        </label>
        <label className="contact-form-label">
          <span>Email</span>
          <input type="email" placeholder="Your email" required className="inquiry-input" />
        </label>
      </div>
      <label className="contact-form-label">
        <span>Subject</span>
        <input type="text" placeholder="How can we help?" required className="inquiry-input" />
      </label>
      <label className="contact-form-label">
        <span>Message</span>
        <textarea placeholder="Write your message..." rows={5} required className="inquiry-input" />
      </label>
      <button type="submit" className="inquiry-submit">
        Submit Request
      </button>
    </form>
  );
}
