import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, currency, type PlanTier } from "@/lib/plans";

function currentPeriod() {
  return new Date().toISOString().slice(0, 7) + "-01";
}

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
  if (!business) redirect("/onboarding");

  const { data: usage } = await supabase
    .from("usage_counters")
    .select("conversations_count")
    .eq("business_id", business.id)
    .eq("period_month", currentPeriod())
    .maybeSingle();

  const currentTier = business.plan_tier as PlanTier;
  const plan = PLANS[currentTier];
  const used = usage?.conversations_count ?? 0;
  const overage = Math.max(0, used - plan.includedConversations);
  const overageCost = overage * plan.overageRate;
  const estimatedTotal = plan.basePrice + overageCost;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Billing</h1>
      <p className="mb-8 text-sm text-ink-muted">Your plan, this month's usage, and what it costs.</p>

      <div className="card mb-6 p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-widest text-ink-muted">Current plan</span>
          <span className="rounded-sm bg-teal-dim px-2 py-1 font-mono text-xs text-teal">{plan.name}</span>
        </div>

        <div className="mb-3 flex items-end justify-between">
          <span className="font-mono text-3xl text-ink">{used}</span>
          <span className="font-mono text-sm text-ink-muted">of {plan.includedConversations} included</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gold"
            style={{ width: `${Math.min(100, Math.round((used / plan.includedConversations) * 100))}%` }}
          />
        </div>

        {overage > 0 && (
          <p className="mt-3 rounded-sm bg-gold-dim px-3.5 py-2.5 text-sm text-ink">
            {overage} conversations over your plan this month, at {currency(plan.overageRate)} each ={" "}
            {currency(overageCost)} extra.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="text-ink-muted">Base plan</span>
          <span className="font-mono text-ink">{currency(plan.basePrice)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-ink-muted">Estimated total this month</span>
          <span className="font-mono text-ink">{currency(estimatedTotal)}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(PLANS) as [PlanTier, (typeof PLANS)[PlanTier]][]).map(([tier, p]) => (
          <div key={tier} className={`card p-5 ${tier === currentTier ? "border-ink/40" : ""}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-ink">{p.name}</span>
              {tier === currentTier && (
                <span className="rounded-sm bg-teal-dim px-1.5 py-0.5 font-mono text-[10px] text-teal">Current</span>
              )}
            </div>
            <p className="mb-3 font-mono text-xl text-ink">{currency(p.basePrice)}<span className="text-sm text-ink-muted">/mo</span></p>
            <p className="mb-3 text-xs text-ink-muted">{p.description}</p>
            <p className="text-xs text-ink-muted">{p.includedConversations.toLocaleString()} conversations included</p>
            <p className="text-xs text-ink-muted">{currency(p.overageRate)} per conversation after</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Self-serve plan changes and live billing aren't turned on yet — to change your plan for now,
        reach out directly and it'll be updated for you.
      </p>
    </div>
  );
}
