"use client";

import { useState, useTransition } from "react";
import { addBusinessLink, deleteBusinessLink } from "@/lib/actions";

type Link = { id: string; label: string; url: string; description: string | null };

export default function LinksManager({ businessId, links }: { businessId: string; links: Link[] }) {
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="card p-6">
      <span className="mb-1 block text-xs uppercase tracking-widest text-ink-muted">Profile links</span>
      <p className="mb-4 text-sm text-ink-muted">
        Shown on your AI's profile panel — your website, Instagram, product catalog, anything a
        customer might want to see.
      </p>

      {links.length > 0 && (
        <ul className="mb-5 space-y-2">
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 rounded-sm bg-paper px-3.5 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{l.label}</p>
                <p className="truncate text-xs text-ink-muted">{l.url}</p>
              </div>
              <button
                disabled={isPending}
                onClick={() => startTransition(() => deleteBusinessLink(l.id))}
                className="shrink-0 text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim() || !url.trim()) return;
          const formData = new FormData();
          formData.set("business_id", businessId);
          formData.set("label", label);
          formData.set("url", url);
          formData.set("description", description);
          startTransition(async () => {
            await addBusinessLink(formData);
            setLabel("");
            setUrl("");
            setDescription("");
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="field-input"
            placeholder="Label, e.g. Instagram"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            className="field-input"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <input
          className="field-input"
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={isPending} className="btn-secondary">
          {isPending ? "Adding..." : "Add link"}
        </button>
      </form>
    </div>
  );
}
