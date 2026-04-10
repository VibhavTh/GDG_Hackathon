import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { FarmSettingsForm } from "./farm-settings-form";
import { StripeConnectCard } from "@/components/admin/stripe-connect-card";

interface Props {
  searchParams: Promise<{ stripe_onboarding?: string }>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { stripe_onboarding } = await searchParams;

  // Sync Stripe account status when returning from onboarding
  // Do this BEFORE querying the farm so the render reflects the fresh state
  if (stripe_onboarding === "complete") {
    const { data: preFarm } = await service
      .from("farms")
      .select("id, stripe_account_id")
      .eq("owner_id", user.id)
      .single();

    if (preFarm?.stripe_account_id) {
      try {
        const account = await stripe.accounts.retrieve(preFarm.stripe_account_id);
        await service
          .from("farms")
          .update({
            stripe_onboarding_complete: account.details_submitted ?? false,
            payouts_enabled: account.payouts_enabled ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", preFarm.id);
      } catch (err) {
        console.error("Failed to sync Stripe account status:", err);
      }
    }
  }

  const { data: farm } = await service
    .from("farms")
    .select("name, description, location, image_url, categories, stripe_account_id, stripe_onboarding_complete, payouts_enabled")
    .eq("owner_id", user.id)
    .single();


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
