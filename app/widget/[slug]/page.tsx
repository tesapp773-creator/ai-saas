import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanTier } from "@/lib/plans";
import ChatWidget from "./chat-widget";

export default async function WidgetPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, public_key, avatar_url, widget_theme_color, widget_wallpaper_url, description, location, working_hours, plan_tier"
    )
    .eq("slug", params.slug)
    .single();

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-ink-muted">This assistant isn't available.</p>
      </main>
    );
  }

  const { data: links } = await supabase
    .from("business_links")
    .select("id, label, url, description")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  // Enforced at display time, not just hidden in settings - if a business is on a
  // plan without wallpaper access, the wallpaper never actually renders, even if
  // one is still saved from a previous plan.
  const plan = PLANS[business.plan_tier as PlanTier];
  const wallpaperUrl = plan.wallpaperEnabled ? business.widget_wallpaper_url : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-8">
      <ChatWidget
        businessName={business.name}
        publicKey={business.public_key}
        avatarUrl={business.avatar_url}
        themeColor={business.widget_theme_color}
        wallpaperUrl={wallpaperUrl}
        description={business.description}
        location={business.location}
        workingHours={business.working_hours}
        links={links ?? []}
      />
    </main>
  );
}
