import { headers } from "next/headers";

// Works out the real, current site address from the incoming request instead of
// relying on a manually-set env var, so the widget link is never a stale placeholder
// on any host (localhost, Vercel preview, Vercel production, or a future custom domain).
export function getSiteUrl() {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");

  if (host) return `${protocol}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
