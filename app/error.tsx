"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Until we wire a real observability backend, send to console.
    // The digest is a stable identifier the server-side log will share.
    console.error("[app/error] caught", error.digest, error);
  }, [error]);

  return (
    <main className="not-found-page">
      <p className="not-found-code">Error</p>
      <h1>Something went wrong</h1>
      <p>
        We&apos;ve logged the issue and our team is on it. Please try again, or
        return to the homepage.
      </p>
      {error.digest && (
        <p style={{ marginTop: 4, fontSize: "0.85rem", opacity: 0.6 }}>
          Reference: {error.digest}
        </p>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button type="button" onClick={reset} className="button-primary">
          Try again
        </button>
        <Link href="/" className="button-secondary">
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}
