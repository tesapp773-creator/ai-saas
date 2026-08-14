"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("error_logs")
      .insert({
        source: "client",
        message: error.message,
        stack: error.stack ?? null,
        path: typeof window !== "undefined" ? window.location.pathname : null,
      })
      .then(() => {});
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="mb-2 text-2xl">Something went wrong</h1>
        <p className="mb-6 text-sm text-ink-muted">
          This has been logged automatically. Try again, or head back to the dashboard.
        </p>
        <button onClick={() => reset()} className="btn-primary">
          Try again
        </button>
      </div>
    </main>
  );
}
