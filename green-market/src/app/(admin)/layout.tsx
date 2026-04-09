import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { Footer } from "@/components/layout/footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use anon client only to verify the session — it calls the Supabase Auth server
  // directly so it's not affected by RLS.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/vendor/login");

  // Use service client for table queries so RLS never blocks the dashboard layout.
  // This is safe — we already confirmed the user's identity above.
  const service = createServiceClient();

  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "farmer" && profile.role !== "admin")) {
    redirect("/");
  }

  const { data: farm } = await service
    .from("farms")
    .select("name")
    .eq("owner_id", user.id)
    .single();

  const farmName = farm?.name ?? "My Farm";
  const userInitial = (farm?.name ?? user.email ?? "F")[0].toUpperCase();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar farmName={farmName} userInitial={userInitial} />
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-6 py-3 bg-surface-container-low border-b border-outline-variant/20">
          <span className="font-headline text-sm font-bold text-tertiary">{farmName}</span>
          <a href="/" className="flex items-center gap-1.5 text-xs font-label font-bold text-primary uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm leading-none">storefront</span>
            Storefront
          </a>
        </div>
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer variant="admin" />
      </div>
      <AdminMobileNav />
    </div>
  );
}
