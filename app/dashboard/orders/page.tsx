import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrdersList from "./orders-list";

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) redirect("/onboarding");

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
