import { Suspense } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { StorefrontNav } from "@/components/layout/storefront-nav";
import { Footer } from "@/components/layout/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<nav className="fixed top-0 left-0 right-0 h-20 bg-surface z-50" />}>
        <AuthAwareNav />
      </Suspense>
      <main className="pt-20 flex-1">{children}</main>
      <Footer variant="storefront" />
    </div>
  );
}

async function AuthAwareNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole: "vendor" | "customer" | "admin" | null = null;

  if (user) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "farmer") userRole = "vendor";
    else if (profile?.role === "customer") userRole = "customer";
    else if (profile?.role === "admin") userRole = "admin";
  }

  return <StorefrontNav userRole={userRole} />;
}
