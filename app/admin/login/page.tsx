"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";

export default function AdminLoginPage() {
  // useSearchParams forces static bailout; wrap in Suspense to satisfy Next 15.
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const flash = searchParams.get("reset") === "ok"
    ? "Password updated. Sign in with your new password."
    : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left — Illustration */}
        <div className="login-illustration">
          <img src="/login-illustration.png" alt="Admin panel illustration" />
        </div>

        {/* Right — Form */}
        <div className="login-form-side">
          <div className="login-form-inner">
            <div className="login-brand">
              <img src="/Favicon/android-chrome-192x192.png" alt="Logo" className="login-logo" />
              <span>Arad Real Estate</span>
            </div>

            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Enter your email address and password to access admin panel.</p>

            {flash && <p className="form-success" style={{ color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>{flash}</p>}
            {error && <p className="form-error">{error}</p>}

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-label">
                <span>Email</span>
                <input type="email" name="email" placeholder="Enter your email" required className="login-input" />
              </label>
              <label className="login-label">
                <span>Password</span>
                <input type="password" name="password" placeholder="Enter your password" required className="login-input" />
              </label>

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p style={{ marginTop: 12, textAlign: "center", fontSize: "0.9rem" }}>
                <Link href="/admin/forgot-password" style={{ color: "var(--accent, #6366f1)", textDecoration: "underline" }}>
                  Forgot password?
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
