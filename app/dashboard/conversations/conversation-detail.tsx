"use client";

import { useState, useTransition } from "react";
import type { CustomerMessage } from "@/lib/types";
import { sendOwnerReply } from "@/lib/actions";

const SENDER_STYLE: Record<string, string> = {
  customer: "self-start bg-white border border-line",
  ai: "self-start bg-teal-dim",
  owner: "self-end bg-ink text-paper",
};

export default function ConversationDetail({
  conversationId,
  businessId,
  messages,
}: {
  conversationId: string;
  businessId: string;
  messages: CustomerMessage[];
}) {
  const [reply, setReply] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex h-full flex-col">
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
          Send
        </button>
      </form>
    </div>
  );
}
