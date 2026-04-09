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
    .select("name, is_approved")
    .eq("owner_id", user.id)
    .single();

  const farmName = farm?.name ?? "My Shop";
  const userInitial = (farm?.name ?? user.email ?? "V")[0].toUpperCase();

  // Vendor is pending approval -- show waiting screen
  if (farm && !farm.is_approved) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-on-primary-container">pending</span>
          </div>
          <h1 className="font-headline italic text-3xl text-tertiary mb-3">
            Pending Approval
          </h1>
          <p className="text-on-surface-variant font-body leading-relaxed mb-8">
            Your vendor account is under review. You will receive an email at <strong>{user.email}</strong> once the admin approves your shop.
          </p>
          <p className="text-xs text-on-surface-variant/60 font-body">
            Questions? Email us at{" "}
            <a href="mailto:greenmarketfarms1@gmail.com" className="text-primary hover:underline">
              greenmarketfarms1@gmail.com
            </a>
          </p>
        </div>
      </div>
    );
  }

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
