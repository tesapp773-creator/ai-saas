"use client";

import { useTransition } from "react";
import type { KnowledgeItem } from "@/lib/types";
import { toggleKnowledgeItem, deleteKnowledgeItem } from "@/lib/actions";

const TYPE_LABEL: Record<string, string> = {
  product: "Product",
  faq: "FAQ",
  policy: "Policy",
};

export default function KnowledgeList({ items }: { items: (KnowledgeItem & { image_url?: string | null })[] }) {
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line px-6 py-10 text-center text-sm text-ink-muted">
        Nothing added yet. Add your first product, FAQ, or policy above so your AI has something to
        work with.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="card flex items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 gap-3">
            {item.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt="" className="h-14 w-14 shrink-0 rounded-sm object-cover" />
            )}
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-sm bg-teal-dim px-2 py-0.5 font-mono text-xs text-teal">
                  {TYPE_LABEL[item.type]}
                </span>
                {!item.is_active && <span className="text-xs text-ink-muted">Hidden from AI</span>}
              </div>
              <p className="font-medium text-ink">{item.title}</p>
              <p className="text-sm text-ink-muted">{item.content}</p>
              {item.price != null && (
                <p className="mt-1 font-mono text-sm text-ink">
                  {item.currency} {item.price}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              disabled={isPending}
              onClick={() => startTransition(() => toggleKnowledgeItem(item.id, !item.is_active))}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {item.is_active ? "Hide" : "Show"}
            </button>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => deleteKnowledgeItem(item.id))}
              className="btn-secondary px-3 py-1.5 text-xs text-ink-muted"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
