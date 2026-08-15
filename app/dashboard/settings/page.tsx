import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBusinessCustomization } from "@/lib/actions";
import SubmitButton from "@/components/submit-button";

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

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Settings</h1>
      <p className="mb-8 text-sm text-ink-muted">Customize how your AI's chat looks to customers.</p>

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

      <form action={updateBusinessCustomization} className="card space-y-5 p-6">
        <input type="hidden" name="business_id" value={business.id} />
        <div>
          <label className="field-label" htmlFor="avatar_url">
            Profile picture (image link)
          </label>
          <input
            className="field-input"
            id="avatar_url"
            name="avatar_url"
            type="url"
            placeholder="https://..."
            defaultValue={business.avatar_url ?? ""}
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Paste a link to an image — shown next to your AI's replies. Upload support is coming
            later; for now, any image hosting link works.
          </p>
        </div>
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
        <SubmitButton pendingText="Saving...">Save</SubmitButton>
      </form>
    </div>
  );
}
