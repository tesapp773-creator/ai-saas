"use client";

import { useEffect, useState, useTransition } from "react";
import type { CustomerMessage } from "@/lib/types";
import { sendOwnerReply } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";

const SENDER_STYLE: Record<string, string> = {
  customer: "self-start bg-white border border-line",
  ai: "self-start bg-teal-dim",
  owner: "self-end bg-ink text-paper",
};

export default function ConversationDetail({
  conversationId,
  businessId,
  messages: initialMessages,
}: {
  conversationId: string;
  businessId: string;
  messages: CustomerMessage[];
}) {
  const [messages, setMessages] = useState<CustomerMessage[]>(initialMessages);
  const [reply, setReply] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Instant path: Supabase Realtime, when it delivers.
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setup() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "customer_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const incoming = payload.new as CustomerMessage;
            setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          }
        )
        .subscribe();
    }

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Guaranteed path: a plain authenticated re-fetch every few seconds, so this page
  // never depends on Realtime alone to stay live - if Realtime misses something,
  // this catches it within a few seconds, no manual refresh ever required.
  useEffect(() => {
    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("customer_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages((prev) => {
          const knownIds = new Set(prev.map((m) => m.id));
          const fresh = data.filter((m) => !knownIds.has(m.id));
          return fresh.length ? [...prev, ...(fresh as CustomerMessage[])] : prev;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-teal" />
        Live
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-line bg-paper p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-md px-3.5 py-2.5 text-sm ${SENDER_STYLE[m.sender]}`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          startTransition(async () => {
            await sendOwnerReply(conversationId, businessId, reply);
            setReply("");
          });
        }}
      >
        <input
          className="field-input flex-1"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to this customer"
        />
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
