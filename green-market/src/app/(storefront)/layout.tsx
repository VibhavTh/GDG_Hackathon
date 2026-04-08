import { createClient, createServiceClient } from "@/lib/supabase/server";
import { StorefrontNav } from "@/components/layout/storefront-nav";
import { Footer } from "@/components/layout/footer";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole: "farmer" | "customer" | null = null;

  if (user) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = (profile?.role as "farmer" | "customer") ?? "customer";
  }

  return (
    <>
      <StorefrontNav userRole={userRole} />
      <main className="pt-20 flex-1">{children}</main>
      <Footer variant="storefront" />
    </>
  );
}
