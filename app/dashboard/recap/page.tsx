import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/get-user-business";

export default async function RecapPage() {
  const { user, business } = await getUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  const supabase = createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: conversations }, { count: handedOff }, { count: orders }] = await Promise.all([
    supabase
      .from("customer_conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("customer_conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .in("status", ["handed_off", "resolved"])
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .gte("created_at", sevenDaysAgo),
  ]);

  const total = conversations ?? 0;
  const resolvedByAI = Math.max(0, total - (handedOff ?? 0));
  const aiRate = total > 0 ? Math.round((resolvedByAI / total) * 100) : 0;

  const dateRange = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(sevenDaysAgo)
  ) + " \u2013 " + new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date());

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-1 text-2xl">Weekly recap</h1>
      <p className="mb-8 text-sm text-ink-muted">Screenshot this to share — built to look good on WhatsApp Status.</p>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-ink text-paper shadow-lg">
        <div className="px-7 pt-8">
          <span className="font-mono text-xs uppercase tracking-widest text-gold">{business.name}</span>
          <p className="mt-1 text-xs text-paper/60">{dateRange}</p>
        </div>

        <div className="space-y-6 px-7 py-8">
          <div>
            <span className="block font-mono text-5xl font-medium">{total}</span>
            <span className="text-sm text-paper/70">conversations this week</span>
          </div>
          <div>
            <span className="block font-mono text-5xl font-medium text-gold">{aiRate}%</span>
            <span className="text-sm text-paper/70">handled by AI alone, no human needed</span>
          </div>
          <div>
            <span className="block font-mono text-5xl font-medium">{orders ?? 0}</span>
            <span className="text-sm text-paper/70">orders captured automatically</span>
          </div>
        </div>

        <div className="border-t border-paper/10 px-7 py-4">
          <span className="font-mono text-xs text-paper/50">Powered by MKJ Business AI</span>
        </div>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs text-ink-muted">
        Tip: take a screenshot of the card above and post it to your WhatsApp Status — a great way
        to show customers your business runs on real AI.
      </p>
    </div>
  );
}
