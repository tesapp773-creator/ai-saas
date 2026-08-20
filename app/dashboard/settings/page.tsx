import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/get-user-business";
import { updateBusinessCustomization } from "@/lib/actions";
import { PLANS, type PlanTier } from "@/lib/plans";
import SubmitButton from "@/components/submit-button";
import ImageUploadField from "./image-upload-field";
import LinksManager from "./links-manager";
import NotificationsToggle from "./notifications-toggle";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const { user, business, role } = await getUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  // Everyone on the team can still turn on their own notifications, even though
  // branding, hours, and links below are owner-only.
  if (role !== "owner") {
    return (
      <div className="max-w-3xl">
        <h1 className="mb-1 text-2xl">Settings</h1>
        <p className="mb-8 text-sm text-ink-muted">
          Business branding and details are managed by the owner. You can still control your own
          notifications below.
        </p>
        <NotificationsToggle businessId={business.id} />
      </div>
    );
  }

  const plan = PLANS[business.plan_tier as PlanTier];

  const supabase = createClient();
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

        {plan.wallpaperEnabled ? (
          <ImageUploadField
            name="widget_wallpaper_url"
            label="Chat wallpaper"
            helpText="Background image for the chat itself, like a WhatsApp wallpaper."
            defaultValue={business.widget_wallpaper_url}
            userId={user.id}
            assetKind="wallpaper"
          />
        ) : (
          <div className="rounded-sm border border-dashed border-line p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="field-label mb-0">Chat wallpaper</span>
              <span className="rounded-sm bg-gold-dim px-1.5 py-0.5 font-mono text-[10px] text-gold">
                Growth plan+
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Custom wallpaper is available on Growth and Business plans.{" "}
              <a href="/dashboard/billing" className="underline underline-offset-2">
                Upgrade to unlock
              </a>
              .
            </p>
          </div>
        )}

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

        <div>
          <label className="field-label" htmlFor="working_hours">
            Working hours
          </label>
          <input
            className="field-input"
            id="working_hours"
            name="working_hours"
            placeholder="e.g. Mon-Sat, 9am - 7pm WAT"
            defaultValue={business.working_hours ?? ""}
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Your AI checks the real current time against this and lets customers know if you're
            currently open or closed, and when to expect a reply.
          </p>
        </div>

        <SubmitButton pendingText="Saving...">Save</SubmitButton>
      </form>

      <LinksManager businessId={business.id} links={links ?? []} />
    </div>
  );
}
