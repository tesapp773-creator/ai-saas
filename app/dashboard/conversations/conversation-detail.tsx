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

  // Live updates: a customer or the AI can send a message from the widget at any
  // moment while this page is open, so this listens for new rows instead of making
  // the owner refresh the page to see them.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
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
