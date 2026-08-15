"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions";

type Order = {
  id: string;
  items: string;
  delivery_details: string | null;
  customer_ref: string;
  status: string;
  created_at: string;
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-gold-dim text-gold",
  confirmed: "bg-teal-dim text-teal",
  fulfilled: "bg-line text-ink-muted",
  cancelled: "bg-line text-ink-muted",
};

export default function OrdersList({ orders }: { orders: Order[] }) {
  const [isPending, startTransition] = useTransition();

  if (orders.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line px-6 py-10 text-center text-sm text-ink-muted">
        No orders yet. Once a customer confirms a purchase in chat, it'll show up here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id} className="card flex items-start justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="font-medium text-ink">{o.items}</p>
            {o.delivery_details && <p className="text-sm text-ink-muted">Delivery: {o.delivery_details}</p>}
            <p className="mt-1 text-xs text-ink-muted">
              {new Date(o.created_at).toLocaleString()}
            </p>
          </div>
          <select
            disabled={isPending}
            value={o.status}
            onChange={(e) => startTransition(() => updateOrderStatus(o.id, e.target.value))}
            className={`shrink-0 rounded-sm border-0 px-2.5 py-1.5 font-mono text-xs ${STATUS_STYLE[o.status]}`}
          >
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </li>
      ))}
    </ul>
  );
}
