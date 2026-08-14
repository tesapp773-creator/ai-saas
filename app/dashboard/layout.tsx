import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/knowledge", label: "AI knowledge" },
    { href: "/dashboard/conversations", label: "Conversations" },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white px-5 py-6">
        <span className="mb-8 font-display text-base font-medium text-ink">MKJ Business AI</span>
        <p className="mb-6 truncate text-sm text-ink-muted">{business.name}</p>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-2 text-sm text-ink hover:bg-paper"
            >
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
