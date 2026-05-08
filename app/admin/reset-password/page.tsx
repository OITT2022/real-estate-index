"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { resetPassword, validateResetToken } from "@/lib/actions";

type Phase = "validating" | "valid" | "invalid" | "submitting" | "done";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [phase, setPhase] = useState<Phase>("validating");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await validateResetToken(token);
      if (cancelled) return;
      setPhase(r.valid ? "valid" : "invalid");
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setPhase("submitting");
    const result = await resetPassword(token, password);
    if (!result.success) {
      setError(result.error ?? "Could not reset password.");
      setPhase("valid");
      return;
    }
    setPhase("done");
    router.push("/admin/login?reset=ok");
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

            <h1 className="login-title">Set a new password</h1>

            {phase === "validating" && <p className="login-subtitle">Verifying link...</p>}

            {phase === "invalid" && (
              <>
                <p className="login-subtitle">This reset link is invalid or has expired.</p>
                <p style={{ marginTop: 16, textAlign: "center" }}>
                  <Link href="/admin/forgot-password" className="login-submit" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
                    Request a new link
                  </Link>
                </p>
              </>
            )}

            {(phase === "valid" || phase === "submitting") && (
              <>
                <p className="login-subtitle">Choose a new password for your admin account.</p>
                {error && <p className="form-error">{error}</p>}
                <form className="login-form" onSubmit={handleSubmit}>
                  <label className="login-label">
                    <span>New password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 10 characters, with a letter and a digit"
                      required
                      className="login-input"
                    />
                  </label>
                  <label className="login-label">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="login-input"
                    />
                  </label>
                  <button className="login-submit" type="submit" disabled={phase === "submitting"}>
                    {phase === "submitting" ? "Updating..." : "Update password"}
                  </button>
                </form>
              </>
            )}

            {phase === "done" && <p className="login-subtitle">Password updated. Redirecting...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
