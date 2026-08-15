"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = { id?: string; sender: "customer" | "ai" | "owner"; content: string };

function getCustomerRef(businessKey: string) {
  const storageKey = `mkj_customer_ref_${businessKey}`;
  let ref = localStorage.getItem(storageKey);
  if (!ref) {
    ref = crypto.randomUUID();
    localStorage.setItem(storageKey, ref);
  }
  return ref;
}

// Persisting the conversation id means refreshing the page continues the same
// conversation instead of silently starting a new one and losing the owner's reply.
function getStoredConversationId(businessKey: string) {
  return localStorage.getItem(`mkj_conversation_id_${businessKey}`);
}

function storeConversationId(businessKey: string, id: string) {
  localStorage.setItem(`mkj_conversation_id_${businessKey}`, id);
}

const SENDER_STYLE: Record<string, string> = {
  customer: "ml-auto bg-ink text-paper",
  ai: "border border-line bg-white text-ink",
  owner: "border border-teal/40 bg-teal-dim text-ink",
};

export default function ChatWidget({
  businessName,
  publicKey,
}: {
  businessName: string;
  publicKey: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", content: `Hi, I'm ${businessName}'s assistant. How can I help?` },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // On load: resume the existing conversation (if any) instead of starting fresh.
  useEffect(() => {
    const stored = getStoredConversationId(publicKey);
    if (!stored) return;

    conversationIdRef.current = stored;
    setConversationId(stored);

    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_key: publicKey, action: "history", conversation_id: stored }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages?.length) setMessages(data.messages);
      })
      .catch(() => {});
  }, [publicKey]);

  // Poll for new messages (like an owner's reply) every few seconds. This keeps the
  // widget feeling live without opening direct database access to unauthenticated visitors.
  useEffect(() => {
    const interval = setInterval(async () => {
      const id = conversationIdRef.current;
      if (!id) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_key: publicKey, action: "history", conversation_id: id }),
        });
        const data = await res.json();
        if (data.messages?.length) {
          setMessages((prev) => {
            const knownIds = new Set(prev.map((m) => m.id).filter(Boolean));
            const fresh = data.messages.filter((m: ChatMessage) => !knownIds.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        }
      } catch {
        // Silent - a missed poll just gets picked up on the next one
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [publicKey]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { sender: "customer", content: text }]);
    setInput("");
    setIsSending(true);

    try {
      const customerRef = getCustomerRef(publicKey);
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_key: publicKey,
          customer_ref: customerRef,
          message: text,
          conversation_id: conversationIdRef.current,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { sender: "ai", content: "Sorry, something went wrong. Please try again." }]);
        return;
      }

      conversationIdRef.current = data.conversation_id;
      setConversationId(data.conversation_id);
      storeConversationId(publicKey, data.conversation_id);
      setMessages((prev) => [...prev, { sender: "ai", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-lg border border-line bg-white">
      <div className="border-b border-line px-4 py-3">
        <p className="font-medium text-ink">{businessName}</p>
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          Usually replies instantly
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper p-4">
        {messages.map((m, i) => (
          <div
            key={m.id ?? i}
            className={`max-w-[80%] rounded-md px-3.5 py-2.5 text-sm ${SENDER_STYLE[m.sender]}`}
          >
            {m.content}
          </div>
        ))}
        {isSending && <p className="text-xs text-ink-muted">Typing…</p>}
      </div>

      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="field-input flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit" className="btn-primary" disabled={isSending}>
          Send
        </button>
      </form>
    </div>
  );
}
