import { createClient } from "@/lib/supabase/server";

// Resolves the business the current user belongs to - as owner or invited staff -
// instead of the old owner-only lookup. Used across every dashboard page.
export async function getUserBusiness() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, business: null, role: null as "owner" | "staff" | null };

  const { data: membership } = await supabase
    .from("business_members")
    .select("role, businesses(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return {
    user,
    business: (membership?.businesses as any) ?? null,
    role: (membership?.role as "owner" | "staff") ?? null,
  };
}
