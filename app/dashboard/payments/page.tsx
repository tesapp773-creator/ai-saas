import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/get-user-business";
import PaymentMethodForm from "./payment-method-form";
import PaymentMethodList from "./payment-method-list";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const { user, business, role } = await getUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");
  if (role !== "owner") redirect("/dashboard");

  const supabase = createClient();
  const { data: methods } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Payment methods</h1>
      <p className="mb-8 text-sm text-ink-muted">
        We never process payments ourselves. Add your own Paystack link, Flutterwave link, or bank
        details, and your AI shares them directly with customers who want to pay.
      </p>

      {searchParams.success && (
        <p className="mb-4 rounded-sm border border-teal/30 bg-teal-dim px-3.5 py-2.5 text-sm text-teal">
          {searchParams.success}
        </p>
      )}
      {searchParams.error && (
        <p className="mb-4 rounded-sm border border-gold/40 bg-gold-dim px-3.5 py-2.5 text-sm text-ink">
          {searchParams.error}
        </p>
      )}

      <PaymentMethodForm businessId={business.id} />
      <PaymentMethodList methods={methods ?? []} />
    </div>
  );
}
