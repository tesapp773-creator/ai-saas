import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/get-user-business";
import OrdersList from "./orders-list";

export default async function OrdersPage() {
  const { user, business } = await getUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  // The moment their AI captures its very first real order ever, that's worth a
  // genuine celebration - the point they go from "testing this" to "this makes money."
  const isFirstOrderMoment = (orders?.length ?? 0) > 0 && !business.first_order_celebrated_at;
  if (isFirstOrderMoment) {
    await supabase
      .from("businesses")
      .update({ first_order_celebrated_at: new Date().toISOString() })
      .eq("id", business.id);
  }

  return (
    <div className="max-w-3xl">
      {isFirstOrderMoment && (
        <div className="mb-6 rounded-lg border border-gold/40 bg-gold-dim p-6 text-center">
          <span className="mb-1 block text-2xl">🎉</span>
          <p className="mb-1 text-lg text-ink">Your AI just captured its first order.</p>
          <p className="text-sm text-ink-muted">
            No form, no back-and-forth from you \u2014 it just happened, on its own, in a real
            conversation.
          </p>
        </div>
      )}

      <h1 className="mb-1 text-2xl">Orders</h1>
      <p className="mb-8 text-sm text-ink-muted">
        When your AI detects a customer has confirmed they want to buy something, it captures it
        here automatically instead of it staying buried in the chat.
      </p>
      <OrdersList orders={orders ?? []} />
    </div>
  );
}
