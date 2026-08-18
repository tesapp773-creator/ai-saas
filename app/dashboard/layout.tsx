import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserBusiness } from "@/lib/get-user-business";
import { signOut } from "@/lib/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, business, role } = await getUserBusiness();

  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/knowledge", label: "AI knowledge" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/conversations", label: "Conversations" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/recap", label: "Weekly recap" },
    // Owner-only: sensitive (payment details) or business-level settings
    ...(role === "owner"
      ? [
          { href: "/dashboard/payments", label: "Payment methods" },
          { href: "/dashboard/billing", label: "Billing" },
          { href: "/dashboard/team", label: "Team" },
          { href: "/dashboard/settings", label: "Settings" },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white px-5 py-6">
        <span className="mb-8 font-display text-base font-medium text-ink">MKJ Business AI</span>
        <p className="mb-1 truncate text-sm text-ink-muted">{business.name}</p>
        {role === "staff" && (
          <span className="mb-6 inline-block w-fit rounded-sm bg-teal-dim px-2 py-0.5 font-mono text-[10px] text-teal">
            Team member
          </span>
        )}
        {role === "owner" && <div className="mb-6" />}
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-sm px-3 py-2 text-sm text-ink hover:bg-paper">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button type="submit" className="px-3 py-2 text-left text-sm text-ink-muted hover:text-ink">
            Log out
          </button>
        </form>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
