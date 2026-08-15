"use client";

import { useTransition } from "react";
import { togglePaymentMethod, deletePaymentMethod } from "@/lib/actions";

type PaymentMethod = {
  id: string;
  method_type: string;
  label: string | null;
  link: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  is_active: boolean;
};

const TYPE_LABEL: Record<string, string> = {
  paystack_link: "Paystack link",
  flutterwave_link: "Flutterwave link",
  bank_transfer: "Bank transfer",
};

export default function PaymentMethodList({ methods }: { methods: PaymentMethod[] }) {
  const [isPending, startTransition] = useTransition();

  if (methods.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line px-6 py-10 text-center text-sm text-ink-muted">
        No payment methods yet. Add one above so your AI can share it when a customer wants to pay.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {methods.map((m) => (
        <li key={m.id} className="card flex items-start justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-sm bg-teal-dim px-2 py-0.5 font-mono text-xs text-teal">
                {TYPE_LABEL[m.method_type]}
              </span>
              {!m.is_active && <span className="text-xs text-ink-muted">Hidden from AI</span>}
            </div>
            {m.label && <p className="font-medium text-ink">{m.label}</p>}
            {m.method_type === "bank_transfer" ? (
              <p className="text-sm text-ink-muted">
                {m.bank_name} · {m.account_name} · {m.account_number}
              </p>
            ) : (
              <p className="break-all text-sm text-ink-muted">{m.link}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              disabled={isPending}
              onClick={() => startTransition(() => togglePaymentMethod(m.id, !m.is_active))}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {m.is_active ? "Hide" : "Show"}
            </button>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => deletePaymentMethod(m.id))}
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
