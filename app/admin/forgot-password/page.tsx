"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-illustration">
          <img src="/login-illustration.png" alt="Admin panel illustration" />
        </div>

        <div className="login-form-side">
          <div className="login-form-inner">
            <div className="login-brand">
              <img src="/Favicon/android-chrome-192x192.png" alt="Logo" className="login-logo" />
              <span>Arad Real Estate</span>
            </div>

            <h1 className="login-title">Forgot password</h1>

            {submitted ? (
              <>
                <p className="login-subtitle">
                  If that email matches an admin account, a reset link is on its way. The link is valid for 1 hour.
                </p>
                <p style={{ marginTop: 16, textAlign: "center", fontSize: "0.95rem" }}>
                  <Link href="/admin/login" style={{ color: "var(--accent, #6366f1)", textDecoration: "underline" }}>
                    Back to sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="login-subtitle">Enter your admin email and we&apos;ll send you a reset link.</p>

                {error && <p className="form-error">{error}</p>}

                <form className="login-form" onSubmit={handleSubmit}>
                  <label className="login-label">
                    <span>Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="login-input"
                    />
                  </label>

                  <button className="login-submit" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send reset link"}
                  </button>

                  <p style={{ marginTop: 12, textAlign: "center", fontSize: "0.9rem" }}>
                    <Link href="/admin/login" style={{ color: "var(--accent, #6366f1)", textDecoration: "underline" }}>
                      Back to sign in
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
