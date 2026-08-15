import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addKnowledgeItem } from "@/lib/actions";
import SubmitButton from "@/components/submit-button";
import KnowledgeList from "./knowledge-list";
import KnowledgeGapsList from "./knowledge-gaps-list";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) redirect("/onboarding");

  const { data: items } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const { data: gaps } = await supabase
    .from("knowledge_gaps")
    .select("*")
    .eq("business_id", business.id)
    .eq("resolved", false)
    .order("occurrences", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">AI knowledge</h1>
      <p className="mb-8 text-sm text-ink-muted">
        Everything here is what your AI knows and will tell customers. Nothing else.
      </p>

      {gaps && gaps.length > 0 && <KnowledgeGapsList gaps={gaps} />}

      {searchParams.success && (
        <p className="mb-4 rounded-sm border border-teal/30 bg-teal-dim px-3.5 py-2.5 text-sm text-teal">
          {searchParams.success}
        </p>
      )}
      {searchParams.error && (
        <p className="mb-4 rounded-sm border border-gold/40 bg-gold-dim px-3.5 py-2.5 text-sm text-ink">
          {searchParams.error}
        </p>
      )}

      <form action={addKnowledgeItem} className="card mb-8 space-y-4 p-6">
        <input type="hidden" name="business_id" value={business.id} />
        <div>
          <label className="field-label" htmlFor="type">
            Type
          </label>
          <select className="field-input" id="type" name="type" required defaultValue="product">
            <option value="product">Product or service</option>
            <option value="faq">FAQ</option>
            <option value="policy">Policy</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="title">
            Title
          </label>
          <input className="field-input" id="title" name="title" placeholder="e.g. Ankara jumpsuit, Delivery time, Return policy" required />
        </div>
        <div>
          <label className="field-label" htmlFor="content">
            Details
          </label>
          <textarea className="field-input" id="content" name="content" rows={3} placeholder="What should the AI say about this?" required />
        </div>
        <div>
          <label className="field-label" htmlFor="price">
            Price (leave blank if not applicable)
          </label>
          <input className="field-input" id="price" name="price" type="number" step="0.01" min="0" />
        </div>
        <SubmitButton pendingText="Adding..." className="btn-primary">
          Add to AI knowledge
        </SubmitButton>
      </form>

      <KnowledgeList items={items ?? []} />
    </div>
  );
}
