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

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Orders</h1>
      <p className="mb-8 text-sm text-ink-muted">
        When your AI detects a customer has confirmed they want to buy something, it captures it
        here automatically instead of it staying buried in the chat.
      </p>
      <OrdersList orders={orders ?? []} />
    </div>
  );
}
