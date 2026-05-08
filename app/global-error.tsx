"use client";

import { useEffect } from "react";

// global-error.tsx must render its own <html>/<body>: it replaces the root
// layout when the error escapes that layer.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error] caught", error.digest, error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          margin: 0,
          background: "#fafafa",
          color: "#111",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", letterSpacing: 2, textTransform: "uppercase", opacity: 0.6 }}>
            Critical error
          </p>
          <h1 style={{ fontSize: "1.6rem", margin: "8px 0 12px" }}>The site couldn&apos;t load</h1>
          <p style={{ opacity: 0.75, marginBottom: 20 }}>
            Something went wrong outside the normal page flow. Please try refreshing.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.8rem", opacity: 0.5, marginBottom: 20 }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
