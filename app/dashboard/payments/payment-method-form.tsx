"use client";

import { useState } from "react";
import { addPaymentMethod } from "@/lib/actions";
import SubmitButton from "@/components/submit-button";

type MethodType = "paystack_link" | "flutterwave_link" | "bank_transfer";

export default function PaymentMethodForm({ businessId }: { businessId: string }) {
  const [methodType, setMethodType] = useState<MethodType>("paystack_link");

  return (
    <form action={addPaymentMethod} className="card mb-8 space-y-4 p-6">
      <input type="hidden" name="business_id" value={businessId} />
      <div>
        <label className="field-label" htmlFor="method_type">
          Type
        </label>
        <select
          className="field-input"
          id="method_type"
          name="method_type"
          value={methodType}
          onChange={(e) => setMethodType(e.target.value as MethodType)}
        >
          <option value="paystack_link">Paystack payment link</option>
          <option value="flutterwave_link">Flutterwave payment link</option>
          <option value="bank_transfer">Bank transfer details</option>
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="label">
          Label (optional)
        </label>
        <input className="field-input" id="label" name="label" placeholder="e.g. Pay by card" />
      </div>

      {methodType !== "bank_transfer" ? (
        <div>
          <label className="field-label" htmlFor="link">
            Payment link
          </label>
          <input
            className="field-input"
            id="link"
            name="link"
            type="url"
            placeholder={methodType === "paystack_link" ? "https://paystack.com/pay/..." : "https://flutterwave.com/pay/..."}
            required
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Create this link on your own {methodType === "paystack_link" ? "Paystack" : "Flutterwave"}{" "}
            dashboard, then paste it here.
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="field-label" htmlFor="bank_name">
              Bank name
            </label>
            <input className="field-input" id="bank_name" name="bank_name" required />
          </div>
          <div>
            <label className="field-label" htmlFor="account_name">
              Account name
            </label>
            <input className="field-input" id="account_name" name="account_name" required />
          </div>
          <div>
            <label className="field-label" htmlFor="account_number">
              Account number
            </label>
            <input className="field-input" id="account_number" name="account_number" required />
          </div>
        </>
      )}

      <SubmitButton pendingText="Adding...">Add payment method</SubmitButton>
    </form>
  );
}
