import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KnowledgeForm from "./knowledge-form";
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

      <KnowledgeForm businessId={business.id} userId={user.id} />
      <KnowledgeList items={items ?? []} />
    </div>
  );
}
