"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { sender: "customer" | "ai"; content: string; image_url?: string | null; flag?: string | null };

export default function TestYourAI({ publicKey, businessName }: { publicKey: string; businessName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;

    const history = messages.map((m) => ({ sender: m.sender, content: m.content }));
    setMessages((prev) => [...prev, { sender: "customer", content: text }]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_key: publicKey, action: "test", message: text, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { sender: "ai", content: "Sorry, something went wrong testing this." }]);
        return;
      }

      let flag: string | null = null;
      if (data.needs_human) flag = "Would hand off to you";
      else if (data.would_create_order) flag = "Would create an order";

      setMessages((prev) => [
        ...prev,
        { sender: "ai", content: data.reply, image_url: data.image_url, flag },
      ]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", content: "Sorry, something went wrong testing this." }]);
    } finally {
      setIsSending(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="card mb-6 flex w-full items-center justify-between p-6 text-left">
        <div>
          <span className="mb-1 block text-xs uppercase tracking-widest text-gold">Try it yourself</span>
          <span className="text-ink">Test your AI right here — ask it anything a customer might.</span>
        </div>
        <span className="text-ink-muted">→</span>
      </button>
    );
  }

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="text-sm font-medium text-ink">Test your AI</span>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-muted underline underline-offset-2">
          Close
        </button>
      </div>

      <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto bg-paper p-4">
        {messages.length === 0 && (
          <p className="text-sm text-ink-muted">
            Try asking {businessName}'s AI a real question — nothing here counts toward your usage or
            shows up in your real conversations.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] ${m.sender === "customer" ? "ml-auto" : ""}`}>
            <div
              className={`rounded-md px-3.5 py-2.5 text-sm ${
                m.sender === "customer" ? "ml-auto bg-ink text-paper" : "border border-line bg-white text-ink"
              } ${m.image_url ? "mb-1.5" : ""}`}
            >
              {m.content}
            </div>
            {m.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.image_url} alt="" className="max-h-40 w-full rounded-md border border-line object-cover" />
            )}
            {m.flag && (
              <span className="mt-1 inline-block rounded-sm bg-gold-dim px-1.5 py-0.5 font-mono text-[10px] text-gold">
                {m.flag}
              </span>
            )}
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
          placeholder="Ask your AI something..."
          disabled={isSending}
        />
        <button type="submit" className="btn-primary" disabled={isSending}>
          Send
        </button>
      </form>
    </div>
  );
}
