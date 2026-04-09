import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { adminLogout as logout } from "@/app/admin/logout/actions";

export default async function SiteAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const unread = await service
    .from("admin_messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)
    .is("archived_at", null);

  const unreadCount = unread.count ?? 0;

  const navItems = [
    { href: "/admin", label: "Inbox", icon: "inbox", badge: unreadCount },
    { href: "/admin/vendors", label: "Vendors", icon: "storefront" },
    { href: "/admin/events", label: "Events", icon: "event" },
    { href: "/admin/newsletter", label: "Newsletter", icon: "mail" },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-low sticky top-0 shrink-0 z-40 py-6">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-headline text-lg text-tertiary font-bold leading-tight">Green Market</h1>
              <p className="text-xs text-on-surface-variant/60 italic">Site Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-tertiary/60 hover:bg-surface-container-highest/50 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {(item.badge ?? 0) > 0 && (
                <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  { item.badge ?? 0 }
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-4 space-y-3">
          <Link
            href="/"
            className="w-full text-on-surface-variant/60 py-2 rounded-lg flex items-center justify-center gap-2 hover:text-tertiary hover:bg-surface-container-highest/50 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-sm">storefront</span>
            View Storefront
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-on-surface-variant/50 hover:text-error hover:bg-surface-container-highest transition-colors rounded-lg text-sm font-medium"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-surface-container-low">
          <span className="font-headline text-sm font-bold text-tertiary">Admin Panel</span>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="relative text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {(item.badge ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-on-secondary text-[9px] font-bold rounded-full flex items-center justify-center">
                    { item.badge ?? 0 }
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
