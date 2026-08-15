import { createClient } from "@/lib/supabase/server";
import ChatWidget from "./chat-widget";

export default async function WidgetPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name, public_key, avatar_url, widget_theme_color")
    .eq("slug", params.slug)
    .single();

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-ink-muted">This assistant isn't available.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-8">
      <ChatWidget
        businessName={business.name}
        publicKey={business.public_key}
        avatarUrl={business.avatar_url}
        themeColor={business.widget_theme_color}
      />
    </main>
  );
}
