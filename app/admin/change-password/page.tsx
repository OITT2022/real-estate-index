"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { changeOwnPassword } from "@/lib/actions";

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const mustChange = (session?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword === true;

  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <main className="admin-content">
        <p className="muted">Loading...</p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (pw !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const result = await changeOwnPassword(current, pw);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Could not change password.");
      return;
    }
    // Sign out so the JWT is refreshed with the cleared mustChangePassword flag.
    await signOut({ callbackUrl: "/admin/login?reset=ok" });
  }

  // Forced flow gets a full-bleed layout (chrome is suppressed by wrappers).
  if (mustChange) {
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
              <h1 className="login-title">Set a new password</h1>
              <p className="login-subtitle">
                You&apos;re using a temporary password. Please choose a new one to continue.
              </p>
              {error && <p className="form-error">{error}</p>}
              <form className="login-form" onSubmit={handleSubmit}>
                <label className="login-label">
                  <span>Current (temporary) password</span>
                  <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className="login-input" />
                </label>
                <label className="login-label">
                  <span>New password</span>
                  <input
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="At least 10 characters, with a letter and a digit"
                    required
                    className="login-input"
                  />
                </label>
                <label className="login-label">
                  <span>Confirm new password</span>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="login-input" />
                </label>
                <button className="login-submit" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update password and sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Voluntary flow uses the standard admin content layout.
  return (
    <main className="admin-content" style={{ maxWidth: 520 }}>
      <h1 className="at-page-title">Change password</h1>
      <p className="at-page-subtitle">Update the password for your admin account.</p>

      {error && <p className="form-error" style={{ marginTop: 16 }}>{error}</p>}

      <form className="login-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label className="login-label">
          <span>Current password</span>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className="login-input" />
        </label>
        <label className="login-label">
          <span>New password</span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="At least 10 characters, with a letter and a digit"
            required
            className="login-input"
          />
        </label>
        <label className="login-label">
          <span>Confirm new password</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="login-input" />
        </label>
        <button className="login-submit" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
        <p className="muted" style={{ marginTop: 8, fontSize: "0.85rem" }}>
          You will be signed out and asked to sign in again with the new password.
        </p>
      </form>
    </main>
  );
}
