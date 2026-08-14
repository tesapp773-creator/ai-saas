"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = { sender: "customer" | "ai"; content: string };

function getCustomerRef(businessKey: string) {
  const storageKey = `mkj_customer_ref_${businessKey}`;
  let ref = localStorage.getItem(storageKey);
  if (!ref) {
    ref = crypto.randomUUID();
    localStorage.setItem(storageKey, ref);
  }
  return ref;
}

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { sender: "customer", content: text }]);
    setInput("");
    setIsSending(true);

    try {
      const customerRef = getCustomerRef(publicKey);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_key: publicKey,
            customer_ref: customerRef,
            message: text,
            conversation_id: conversationId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", content: "Sorry, something went wrong. Please try again." },
        ]);
        return;
      }

      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, { sender: "ai", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-lg border border-line bg-white">
      <div className="border-b border-line px-4 py-3">
        <p className="font-medium text-ink">{businessName}</p>
        <p className="text-xs text-ink-muted">Usually replies instantly</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-md px-3.5 py-2.5 text-sm ${
              m.sender === "customer"
                ? "ml-auto bg-ink text-paper"
                : "border border-line bg-white text-ink"
            }`}
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
