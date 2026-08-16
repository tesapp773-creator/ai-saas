import { createClient } from "@/lib/supabase/server";
import ChatWidget from "./chat-widget";

export default async function WidgetPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, public_key, avatar_url, widget_theme_color, widget_wallpaper_url, description, location, working_hours")
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-8">
      <ChatWidget
        businessName={business.name}
        publicKey={business.public_key}
        avatarUrl={business.avatar_url}
        themeColor={business.widget_theme_color}
        wallpaperUrl={business.widget_wallpaper_url}
        description={business.description}
        location={business.location}
        workingHours={business.working_hours}
        links={links ?? []}
      />
    </main>
  );
}
