"use client";

import { useEffect } from "react";

// Catches errors severe enough to crash the root layout itself. Kept dependency-free
// and style-free (no Tailwind) since this can render before the app's own styles do.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/error_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      },
      body: JSON.stringify({
        source: "client",
        message: error.message,
        stack: error.stack ?? null,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "sans-serif" }}>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>Something went wrong</h1>
            <p style={{ color: "#5B6478", marginBottom: "1.5rem" }}>
              This has been logged automatically.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: "#14213D",
                color: "#FBF9F4",
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                border: "none",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
