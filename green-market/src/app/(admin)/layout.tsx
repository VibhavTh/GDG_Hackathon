import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { Footer } from "@/components/layout/footer";
import { StorefrontNav } from "@/components/layout/storefront-nav";
import { VoiceAssistantWidget } from "@/components/admin/voice-assistant/widget";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant font-body animate-pulse">Loading...</p>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

async function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/vendor/login");

  const service = createServiceClient();

  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "farmer" && profile.role !== "admin")) {
    redirect("/");
  }

  const site = await getSiteSettings();

  const farmName = site?.name ?? "The Green Market Farm";
  const userInitial = (site?.name ?? user.email ?? "V")[0].toUpperCase();

  const { count: inboxUnread } = await service
    .from("admin_messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)
    .is("archived_at", null);

  return (
    <div className="min-h-screen">
      <StorefrontNav userRole="vendor" />
      <div className="flex pt-20">
        <AdminSidebar farmName={farmName} userInitial={userInitial} inboxUnread={inboxUnread ?? 0} />
        <div className="flex-1 flex flex-col">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-6 py-3 bg-surface-container-low border-b border-outline-variant/20">
            <span className="font-headline text-sm font-bold text-tertiary">{farmName}</span>
          </div>
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <Footer variant="admin" />
        </div>
      </div>
      <AdminMobileNav />
      <VoiceAssistantWidget />
    </div>
  );
}
