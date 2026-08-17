import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/get-user-business";

export default async function AnalyticsPage() {
  const { user, business } = await getUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  const supabase = createClient();

  const [
    { count: totalConversations },
    { count: handedOffCount },
    { count: resolvedCount },
    { count: gapCount },
    { count: newOrders },
    { data: usageRows },
  ] = await Promise.all([
    supabase.from("customer_conversations").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("customer_conversations").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "handed_off"),
    supabase.from("customer_conversations").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "resolved"),
    supabase.from("knowledge_gaps").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("resolved", false),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "new"),
    supabase
      .from("usage_counters")
      .select("period_month, conversations_count, messages_count")
      .eq("business_id", business.id)
      .order("period_month", { ascending: false })
      .limit(6),
  ]);

  const total = totalConversations ?? 0;
  const neededHuman = (handedOffCount ?? 0) + (resolvedCount ?? 0);
  const aiOnlyRate = total > 0 ? Math.round(((total - neededHuman) / total) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Analytics</h1>
      <p className="mb-8 text-sm text-ink-muted">How your AI is actually performing.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <span className="block text-xs uppercase tracking-widest text-ink-muted">Conversations</span>
          <span className="font-mono text-2xl text-ink">{total}</span>
        </div>
        <div className="card p-4">
          <span className="block text-xs uppercase tracking-widest text-ink-muted">AI-only resolved</span>
          <span className="font-mono text-2xl text-ink">{aiOnlyRate}%</span>
        </div>
        <div className="card p-4">
          <span className="block text-xs uppercase tracking-widest text-ink-muted">Open gaps</span>
          <span className="font-mono text-2xl text-ink">{gapCount ?? 0}</span>
        </div>
        <div className="card p-4">
          <span className="block text-xs uppercase tracking-widest text-ink-muted">New orders</span>
          <span className="font-mono text-2xl text-ink">{newOrders ?? 0}</span>
        </div>
      </div>

      <div className="card p-6">
        <span className="mb-4 block text-xs uppercase tracking-widest text-ink-muted">Monthly usage</span>
        {usageRows && usageRows.length > 0 ? (
          <ul className="space-y-3">
            {usageRows.map((row) => (
              <li key={row.period_month} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">
                  {new Date(row.period_month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </span>
                <span className="font-mono text-ink">
                  {row.conversations_count} conversations · {row.messages_count} messages
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No usage yet.</p>
        )}
      </div>
    </div>
  );
}
