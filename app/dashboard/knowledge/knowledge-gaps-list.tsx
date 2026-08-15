"use client";

import { useTransition } from "react";
import { resolveKnowledgeGap } from "@/lib/actions";

type Gap = { id: string; question: string; occurrences: number };

export default function KnowledgeGapsList({ gaps }: { gaps: Gap[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="card mb-6 p-6">
      <span className="mb-1 block text-xs uppercase tracking-widest text-gold">Knowledge gaps</span>
      <p className="mb-4 text-sm text-ink-muted">
        Questions your AI couldn't confidently answer. Add the answer above, then mark it resolved.
      </p>
      <ul className="space-y-2">
        {gaps.map((g) => (
          <li key={g.id} className="flex items-center justify-between gap-3 rounded-sm bg-paper px-3.5 py-2.5 text-sm">
            <span className="min-w-0 truncate text-ink">
              {g.question}
              {g.occurrences > 1 && (
                <span className="ml-2 font-mono text-xs text-ink-muted">×{g.occurrences}</span>
              )}
            </span>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => resolveKnowledgeGap(g.id))}
              className="shrink-0 text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
            >
              Mark resolved
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
