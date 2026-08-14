import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

function currentPeriod() {
  return new Date().toISOString().slice(0, 7) + "-01";
}

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const { data: usage } = await supabase
    .from("usage_counters")
    .select("conversations_count, messages_count")
    .eq("business_id", business.id)
    .eq("period_month", currentPeriod())
    .maybeSingle();

  const { count: knowledgeCount } = await supabase
    .from("knowledge_items")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const used = usage?.conversations_count ?? 0;
  const included = business.conversations_included;
  const percent = Math.min(100, Math.round((used / included) * 100));
  const hasKnowledge = (knowledgeCount ?? 0) > 0;
  const hasConversation = used > 0;

  const widgetUrl = getSiteUrl() + "/widget/" + business.slug;

  const checklist = [
    { label: "Create your business", done: true },
    { label: "Add your first product, FAQ, or policy", done: hasKnowledge, href: "/dashboard/knowledge" },
    { label: "Get your first customer conversation", done: hasConversation },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Overview</h1>
      <p className="mb-8 text-sm text-ink-muted">
        Here's how {business.name}'s AI assistant is doing this month.
      </p>

      {!hasKnowledge && (
        <div className="card mb-6 p-6">
          <span className="mb-3 block text-xs uppercase tracking-widest text-ink-muted">
            Getting started
          </span>
          <ul className="space-y-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    item.done ? "bg-teal text-paper" : "border border-line text-transparent"
                  }`}
                >
                  ✓
                </span>
                {item.href && !item.done ? (
                  <a href={item.href} className="text-ink underline underline-offset-2">
                    {item.label}
                  </a>
                ) : (
                  <span className={item.done ? "text-ink-muted line-through" : "text-ink"}>
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Signature element: the usage ledger */}
      <div className="card mb-6 p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-widest text-ink-muted">
            This month's usage
          </span>
          <span className="rounded-sm bg-teal-dim px-2 py-1 font-mono text-xs text-teal">
            {business.plan_tier} plan
          </span>
        </div>
        <div className="mb-2 flex items-end justify-between">
          <span className="font-mono text-3xl text-ink">{used}</span>
          <span className="font-mono text-sm text-ink-muted">of {included} conversations</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          {usage?.messages_count ?? 0} messages handled · resets on the 1st
        </p>
      </div>

      <div className="card p-6">
        <span className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">
          Your AI assistant's link
        </span>
        <p className="mb-3 text-sm text-ink-muted">
          Share this with customers, or embed it on your own website.
        </p>
        <code className="block break-all rounded-sm bg-paper px-3.5 py-2.5 font-mono text-sm text-ink">
          {widgetUrl}
        </code>
      </div>
    </div>
  );
}
