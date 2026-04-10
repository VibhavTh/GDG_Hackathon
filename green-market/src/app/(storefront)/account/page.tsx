import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { upgradeToVendor } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AccountPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/customer/login?next=/account");

  const service = createServiceClient();

  const [{ data: profile }, { count: orderCount }] = await Promise.all([
    service.from("users").select("role, created_at").eq("id", user.id).single(),
    service.from("orders").select("id", { count: "exact", head: true })
      .or(`customer_id.eq.${user.id},guest_email.eq.${user.email}`),
  ]);

  const { error } = await searchParams;
  const joinedYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;
  const initials = (user.email ?? "?")[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-slide-up">
        <span className="text-secondary font-label text-xs uppercase tracking-widest mb-2 block">
          Your Account
        </span>
        <h1 className="text-4xl font-headline italic text-tertiary">
          My Profile
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-error/10 text-error rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3 animate-slide-down">
          <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-surface-container-low rounded-2xl p-8 mb-6 animate-slide-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-5 mb-8">
          <div className="p-1 bg-surface ring-1 ring-outline-variant/20 rounded-[1.125rem] shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-2xl font-headline">
              {initials}
            </div>
          </div>
          <div>
            <p className="font-headline text-xl text-tertiary leading-tight">{user.email}</p>
            <p className="text-xs text-on-surface-variant font-label mt-1 uppercase tracking-widest">
              {joinedYear ? `Member since ${joinedYear}` : "Customer"}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-8">
          <div className="p-1 bg-surface-container ring-1 ring-outline-variant/20 rounded-[0.875rem] flex-1">
            <div className="bg-surface-container-low px-5 py-4 rounded-xl text-center">
              <p className="text-2xl font-headline text-primary leading-none mb-1">{orderCount ?? 0}</p>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Orders</p>
            </div>
          </div>
          <div className="p-1 bg-surface-container ring-1 ring-outline-variant/20 rounded-[0.875rem] flex-1">
            <div className="bg-surface-container-low px-5 py-4 rounded-xl text-center">
              <p className="text-2xl font-headline text-primary leading-none mb-1 capitalize">{profile?.role === "farmer" ? "Vendor" : "Customer"}</p>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Account Type</p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          <Link
            href="/account/orders"
            className="flex items-center justify-between px-5 py-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors duration-150 group"
          >
            <div className="flex items-center gap-3">
              <Icon name="receipt_long" className="text-on-surface-variant" />
              <span className="font-label font-medium text-on-surface text-sm">Order History</span>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform duration-150" size="sm" />
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-between px-5 py-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors duration-150 group"
          >
            <div className="flex items-center gap-3">
              <Icon name="storefront" className="text-on-surface-variant" />
              <span className="font-label font-medium text-on-surface text-sm">Browse Products</span>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform duration-150" size="sm" />
          </Link>
        </div>
      </div>

      {/* Become a vendor section -- shown to anyone who isn't already a vendor */}
      {profile?.role !== "farmer" && (
        <div className="bg-surface-container-low rounded-2xl p-8 mb-6 animate-slide-up" style={{ animationDelay: "160ms" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Icon name="agriculture" className="text-secondary" />
            </div>
            <div>
              <h2 className="font-headline italic text-xl text-tertiary mb-1">Sell on Green Market</h2>
              <p className="text-sm text-on-surface-variant font-body">
                Turn your account into a vendor account and start listing products. Your order history stays intact.
              </p>
            </div>
          </div>

          <form action={upgradeToVendor}>
            <button
              type="submit"
              className="w-full bg-secondary text-on-secondary font-label font-bold py-3 rounded-xl hover:bg-secondary/90 active:scale-[0.97] transition-all duration-150 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Icon name="storefront" size="sm" />
              Become a Vendor
            </button>
          </form>

          <p className="text-xs text-on-surface-variant/60 font-body text-center mt-3">
            You can still shop as a customer after upgrading.
          </p>
        </div>
      )}

      {/* Sign out */}
      <div className="flex justify-end animate-slide-up" style={{ animationDelay: "200ms" }}>
        <SignOutButton role="customer" className="text-sm" />
      </div>
    </div>
  );
}
