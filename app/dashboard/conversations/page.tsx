import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConversationDetail from "./conversation-detail";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-teal-dim text-teal",
  handed_off: "bg-gold-dim text-gold",
  resolved: "bg-line text-ink-muted",
};

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
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

  const { data: conversations } = await supabase
    .from("customer_conversations")
    .select("*")
    .eq("business_id", business.id)
    .order("updated_at", { ascending: false });

  const activeId = searchParams.id ?? conversations?.[0]?.id;

  let messages: any[] = [];
  if (activeId) {
    const { data } = await supabase
      .from("customer_messages")
      .select("*")
      .eq("conversation_id", activeId)
      .order("created_at", { ascending: true });
    messages = data ?? [];
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-5xl gap-6">
      <div className="w-72 shrink-0 overflow-y-auto">
        <h1 className="mb-4 text-2xl">Conversations</h1>
        {(!conversations || conversations.length === 0) && (
          <p className="text-sm text-ink-muted">
            No customer conversations yet. Once your AI link is shared, they'll show up here.
          </p>
        )}
        <ul className="space-y-2">
          {conversations?.map((c) => (
            <li key={c.id}>
              <a
                href={`/dashboard/conversations?id=${c.id}`}
                className={`block rounded-md border px-3.5 py-3 text-sm ${
                  c.id === activeId ? "border-ink/30 bg-white" : "border-line bg-white"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-ink">{c.customer_ref}</span>
                  <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] ${STATUS_STYLE[c.status]}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <span className="text-xs text-ink-muted">
                  {new Date(c.updated_at).toLocaleString()}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1">
        {activeId ? (
          <ConversationDetail
            conversationId={activeId}
            businessId={business.id}
            messages={messages}
          />
        ) : (
          <p className="pt-16 text-center text-sm text-ink-muted">
            Select a conversation to view it.
          </p>
        )}
      </div>
    </div>
  );
}
