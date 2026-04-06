"use client";

import { useState } from "react";

type Props = {
  projectTitle: string;
};

export function ProjectInquiryForm({ projectTitle }: Props) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="inquiry-card">
        <div className="inquiry-success">
          <div className="inquiry-success-icon">&#10003;</div>
          <h3>Message sent!</h3>
          <p>Your inquiry about <strong>{projectTitle}</strong> has been delivered. We will contact you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="inquiry-card">
      <div className="inquiry-header">
        <div className="inquiry-icon">&#9993;</div>
        <div>
          <h3 style={{ margin: 0 }}>Interested in this project?</h3>
          <p className="muted" style={{ margin: "4px 0 0" }}>Get in touch about {projectTitle}</p>
        </div>
      </div>

      <div className="inquiry-fields">
        <div className="inquiry-row">
          <label className="inquiry-label">
            <input placeholder="Full name *" required className="inquiry-input" />
          </label>
          <label className="inquiry-label">
            <input type="email" placeholder="Email address *" required className="inquiry-input" />
          </label>
        </div>
        <label className="inquiry-label">
          <input placeholder="Phone number (optional)" className="inquiry-input" />
        </label>
        <label className="inquiry-label">
          <textarea placeholder={`Hi, I'm interested in ${projectTitle} and would like to know more...`} rows={4} required className="inquiry-input" />
        </label>
      </div>

      <button type="submit" className="inquiry-submit">
        Send Message
      </button>
    </form>
  );
}
