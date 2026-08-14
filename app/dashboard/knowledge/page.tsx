import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addKnowledgeItem } from "@/lib/actions";
import KnowledgeList from "./knowledge-list";

export default async function KnowledgePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const { data: items } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">AI knowledge</h1>
      <p className="mb-8 text-sm text-ink-muted">
        Everything here is what your AI knows and will tell customers. Nothing else.
      </p>

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
          <input
            className="field-input"
            id="title"
            name="title"
            placeholder="e.g. Ankara jumpsuit, Delivery time, Return policy"
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="content">
            Details
          </label>
          <textarea
            className="field-input"
            id="content"
            name="content"
            rows={3}
            placeholder="What should the AI say about this?"
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="price">
            Price (leave blank if not applicable)
          </label>
          <input className="field-input" id="price" name="price" type="number" step="0.01" min="0" />
        </div>
        <button type="submit" className="btn-primary">
          Add to AI knowledge
        </button>
      </form>

      <KnowledgeList items={items ?? []} />
    </div>
  );
}
