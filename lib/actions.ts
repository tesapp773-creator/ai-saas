"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name"));

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createBusiness(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = String(formData.get("name"));
  const industry = String(formData.get("industry") || "");
  const description = String(formData.get("description") || "");

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name,
    industry: industry || null,
    description: description || null,
    slug: slugify(name),
  });

  if (error) redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function addKnowledgeItem(formData: FormData) {
  const supabase = createClient();
  const businessId = String(formData.get("business_id"));
  const type = String(formData.get("type"));
  const title = String(formData.get("title"));
  const content = String(formData.get("content"));
  const priceRaw = formData.get("price");
  const price = priceRaw ? Number(priceRaw) : null;

  const { error } = await supabase.from("knowledge_items").insert({ business_id: businessId, type, title, content, price });

  if (error) redirect(`/dashboard/knowledge?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/knowledge");
  redirect("/dashboard/knowledge?success=Added to your AI's knowledge");
}

export async function toggleKnowledgeItem(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("knowledge_items").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/knowledge");
}

export async function deleteKnowledgeItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("knowledge_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/knowledge");
}

export async function resolveKnowledgeGap(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("knowledge_gaps").update({ resolved: true }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/knowledge");
}

export async function sendOwnerReply(conversationId: string, businessId: string, content: string) {
  const supabase = createClient();
  const { error } = await supabase.from("customer_messages").insert({
    conversation_id: conversationId,
    business_id: businessId,
    sender: "owner",
    content,
  });

  if (error) throw new Error(error.message);

  await supabase.from("customer_conversations").update({ status: "resolved" }).eq("id", conversationId);
  revalidatePath("/dashboard/conversations");
}

export async function addPaymentMethod(formData: FormData) {
  const supabase = createClient();
  const businessId = String(formData.get("business_id"));
  const methodType = String(formData.get("method_type"));
  const label = String(formData.get("label") || "") || null;
  const link = String(formData.get("link") || "") || null;
  const bankName = String(formData.get("bank_name") || "") || null;
  const accountName = String(formData.get("account_name") || "") || null;
  const accountNumber = String(formData.get("account_number") || "") || null;

  const { error } = await supabase.from("payment_methods").insert({
    business_id: businessId,
    method_type: methodType,
    label,
    link,
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
  });

  if (error) redirect(`/dashboard/payments?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/payments");
  redirect("/dashboard/payments?success=Payment method added");
}

export async function deletePaymentMethod(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/payments");
}

export async function togglePaymentMethod(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("payment_methods").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/payments");
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/orders");
}

export async function updateBusinessCustomization(formData: FormData) {
  const supabase = createClient();
  const businessId = String(formData.get("business_id"));
  const avatarUrl = String(formData.get("avatar_url") || "") || null;
  const themeColor = String(formData.get("widget_theme_color") || "#14213D");

  const { error } = await supabase
    .from("businesses")
    .update({ avatar_url: avatarUrl, widget_theme_color: themeColor })
    .eq("id", businessId);

  if (error) redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?success=Saved");
}
