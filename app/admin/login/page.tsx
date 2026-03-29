"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <main className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card">
          <p className="eyebrow">Admin access</p>
          <h1>Login</h1>

          {error && <p className="form-error">{error}</p>}

          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input type="email" name="email" placeholder="admin@example.com" required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" placeholder="••••••••" required />
            </label>
            <button className="button-primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
