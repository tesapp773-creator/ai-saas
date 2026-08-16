"use client";

import { useEffect, useRef, useState } from "react";
import BusinessProfilePanel from "./business-profile-panel";

type ChatMessage = { id?: string; sender: "customer" | "ai" | "owner"; content: string; image_url?: string | null };
type Link = { id: string; label: string; url: string; description: string | null };

function getCustomerRef(businessKey: string) {
  const storageKey = `mkj_customer_ref_${businessKey}`;
  let ref = localStorage.getItem(storageKey);
  if (!ref) {
    ref = crypto.randomUUID();
    localStorage.setItem(storageKey, ref);
  }
  return ref;
}

function getStoredConversationId(businessKey: string) {
  return localStorage.getItem(`mkj_conversation_id_${businessKey}`);
}

function storeConversationId(businessKey: string, id: string) {
  localStorage.setItem(`mkj_conversation_id_${businessKey}`, id);
}

export default function ChatWidget({
  businessName,
  publicKey,
  avatarUrl,
  themeColor,
  wallpaperUrl,
  description,
  location,
  workingHours,
  links,
}: {
  businessName: string;
  publicKey: string;
  avatarUrl?: string | null;
  themeColor?: string | null;
  wallpaperUrl?: string | null;
  description?: string | null;
  location?: string | null;
  workingHours?: string | null;
  links: Link[];
}) {
  const color = themeColor || "#14213D";
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", content: `Hi, I'm ${businessName}'s assistant. How can I help?` },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const stored = getStoredConversationId(publicKey);
    if (!stored) return;
    conversationIdRef.current = stored;

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
    if (!text || isSendingRef.current) return;

    isSendingRef.current = true;
    setIsSending(true);

    const tempId = `temp-${crypto.randomUUID()}`;
    setMessages((prev) => [...prev, { id: tempId, sender: "customer", content: text }]);
    setInput("");

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
      storeConversationId(publicKey, data.conversation_id);

      setMessages((prev) => {
        const reconciled = prev.map((m) => (m.id === tempId ? { ...m, id: data.customer_message_id ?? m.id } : m));
        return [
          ...reconciled,
          { id: data.ai_message_id, sender: "ai", content: data.reply, image_url: data.image_url ?? null },
        ];
      });
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }

  return (
    <div className="relative flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-lg border border-line bg-white">
      {showProfile && (
        <BusinessProfilePanel
          businessName={businessName}
          avatarUrl={avatarUrl}
          themeColor={color}
          description={description}
          location={location}
          workingHours={workingHours}
          links={links}
          onClose={() => setShowProfile(false)}
        />
      )}

      <button
        onClick={() => setShowProfile(true)}
        className="flex items-center gap-3 border-b border-line px-4 py-3 text-left"
        style={{ backgroundColor: color }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-medium text-white">
            {businessName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-white">{businessName}</p>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            Usually replies instantly
          </p>
        </div>
      </button>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-paper bg-cover bg-center p-4"
        style={wallpaperUrl ? { backgroundImage: `url(${wallpaperUrl})` } : undefined}
      >
        {messages.map((m, i) => (
          <div key={m.id ?? i} className={`max-w-[80%] ${m.sender === "customer" ? "ml-auto" : ""}`}>
            {m.content && (
              <div
                className={`rounded-md px-3.5 py-2.5 text-sm shadow-sm ${
                  m.sender === "customer" ? "text-white" : "border border-line bg-white text-ink"
                } ${m.image_url ? "mb-1.5" : ""}`}
                style={m.sender === "customer" ? { backgroundColor: color } : undefined}
              >
                {m.content}
              </div>
            )}
            {m.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.image_url}
                alt=""
                className="max-h-64 w-full rounded-md border border-line object-cover shadow-sm"
              />
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
          placeholder="Ask a question..."
          disabled={isSending}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: color }}
          disabled={isSending}
        >
          Send
        </button>
      </form>
    </div>
  );
}
