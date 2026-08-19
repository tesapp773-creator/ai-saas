"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpgradeButton({ businessId, planTier }: { businessId: string; planTier: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Please log in again.");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/paystack-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ business_id: businessId, plan_tier: planTier }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        setError(data.error || "Could not start checkout");
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleUpgrade} disabled={loading} className="btn-primary w-full">
        {loading ? "Starting checkout..." : "Upgrade to this plan"}
      </button>
      {error && <p className="mt-1.5 text-xs text-gold">{error}</p>}
    </div>
  );
}
