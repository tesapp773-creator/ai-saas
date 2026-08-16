import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBusinessCustomization } from "@/lib/actions";
import SubmitButton from "@/components/submit-button";
import ImageUploadField from "./image-upload-field";
import LinksManager from "./links-manager";
import NotificationsToggle from "./notifications-toggle";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
  if (!business) redirect("/onboarding");

  const { data: links } = await supabase
    .from("business_links")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Settings</h1>
      <p className="mb-8 text-sm text-ink-muted">
        Customize how your AI's chat looks, and what customers see when they tap its profile.
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

      <div className="mb-8">
        <NotificationsToggle businessId={business.id} />
      </div>

      <form action={updateBusinessCustomization} className="card mb-8 space-y-5 p-6">
        <input type="hidden" name="business_id" value={business.id} />

        <ImageUploadField
          name="avatar_url"
          label="Profile picture"
          helpText="Shown as your AI's avatar in the chat header and profile panel."
          defaultValue={business.avatar_url}
          userId={user.id}
          assetKind="avatar"
        />

        <ImageUploadField
          name="widget_wallpaper_url"
          label="Chat wallpaper"
          helpText="Background image for the chat itself, like a WhatsApp wallpaper."
          defaultValue={business.widget_wallpaper_url}
          userId={user.id}
          assetKind="wallpaper"
        />

        <div>
          <label className="field-label" htmlFor="widget_theme_color">
            Chat color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="widget_theme_color"
              name="widget_theme_color"
              defaultValue={business.widget_theme_color}
              className="h-10 w-14 cursor-pointer rounded-sm border border-line"
            />
            <span className="font-mono text-sm text-ink-muted">{business.widget_theme_color}</span>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="location">
            Location
          </label>
          <input
            className="field-input"
            id="location"
            name="location"
            placeholder="e.g. Lekki, Lagos"
            defaultValue={business.location ?? ""}
          />
          <p className="mt-1.5 text-xs text-ink-muted">Shown on your AI's profile panel.</p>
        </div>

        <SubmitButton pendingText="Saving...">Save</SubmitButton>
      </form>

      <LinksManager businessId={business.id} links={links ?? []} />
    </div>
  );
}
