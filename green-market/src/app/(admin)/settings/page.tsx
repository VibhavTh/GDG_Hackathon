import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { FarmSettingsForm } from "./farm-settings-form";
import { StripeConnectCard } from "@/components/admin/stripe-connect-card";
import { syncStripeAccountStatus } from "./actions";

interface Props {
  searchParams: Promise<{ stripe_onboarding?: string }>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { data: farm } = await service
    .from("farms")
    .select("name, description, location, image_url, categories, stripe_account_id, stripe_onboarding_complete, payouts_enabled")
    .eq("owner_id", user.id)
    .single();

  const { stripe_onboarding } = await searchParams;

  // Sync Stripe account status when returning from onboarding
  if (stripe_onboarding === "complete" && farm?.stripe_account_id) {
    await syncStripeAccountStatus();
  }


  return (
    <div className="p-6 md:p-12 max-w-3xl">
      <header className="mb-10">
        <h1 className="text-4xl font-headline italic text-tertiary">
          Farm Settings
        </h1>
        <p className="text-on-surface-variant mt-2 font-body">
          Update your farm profile. Changes appear on your public farm page immediately.
        </p>
      </header>

      <StripeConnectCard
        stripeAccountId={farm?.stripe_account_id ?? null}
        onboardingComplete={farm?.stripe_onboarding_complete ?? false}
        payoutsEnabled={farm?.payouts_enabled ?? false}
      />

      <FarmSettingsForm farm={farm ?? null} />
    </div>
  );
}
