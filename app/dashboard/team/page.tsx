import { redirect } from "next/navigation";
import { getUserBusiness } from "@/lib/get-user-business";
import { inviteTeamMember, removeTeamMember } from "@/lib/actions";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const { user, business, role } = await getUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  const supabase = (await import("@/lib/supabase/server")).createClient();
  const { data: members } = await supabase
    .from("business_members")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">Team</h1>
      <p className="mb-8 text-sm text-ink-muted">
        Anyone on the team can help with knowledge, conversations, and orders. Payment details and
        business settings stay owner-only.
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

      {role === "owner" && (
        <form action={inviteTeamMember} className="card mb-8 flex items-end gap-3 p-6">
          <input type="hidden" name="business_id" value={business.id} />
          <div className="flex-1">
            <label className="field-label" htmlFor="invited_email">
              Invite by email
            </label>
            <input
              className="field-input"
              id="invited_email"
              name="invited_email"
              type="email"
              placeholder="staffmember@email.com"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Invite
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {members?.map((m) => (
          <li key={m.id} className="card flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{m.invited_email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-sm bg-teal-dim px-2 py-0.5 font-mono text-xs text-teal">{m.role}</span>
                <span className="text-xs text-ink-muted">
                  {m.status === "active" ? "Active" : "Invited \u2014 waiting for them to sign up"}
                </span>
              </div>
            </div>
            {role === "owner" && m.role !== "owner" && (
              <form action={removeTeamMember.bind(null, m.id)}>
                <button type="submit" className="btn-secondary px-3 py-1.5 text-xs text-ink-muted">
                  Remove
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {role === "owner" && (
        <p className="mt-6 text-xs text-ink-muted">
          When they sign up using the exact email you invited, they're automatically added — no
          separate business setup on their end.
        </p>
      )}
    </div>
  );
}
