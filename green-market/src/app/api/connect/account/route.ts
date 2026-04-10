import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data: farm } = await service
      .from("farms")
      .select("id, stripe_account_id")
      .eq("owner_id", user.id)
      .single();

    if (!farm) {
      return NextResponse.json(
        { error: "No farm found. Please complete farm setup first." },
        { status: 400 }
      );
    }

    if (farm.stripe_account_id) {
      return NextResponse.json(
        { error: "Stripe account already exists. Use GET to create a new onboarding link." },
        { status: 409 }
      );
    }

    // Create Stripe connected account with controller properties
    const account = await stripe.accounts.create({
      controller: {
        losses: { payments: "application" },
        fees: { payer: "application" },
        requirement_collection: "stripe",
        stripe_dashboard: { type: "express" },
      },
      country: "US",
      email: user.email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        farm_id: farm.id,
        platform: "green_market",
      },
    });

    // Save stripe_account_id to farm
    await service
      .from("farms")
      .update({ stripe_account_id: account.id, updated_at: new Date().toISOString() })
      .eq("id", farm.id);

    // Create Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/connect/account?refresh=1`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?stripe_onboarding=complete`,
      type: "account_onboarding",
      collection_options: { fields: "eventually_due" },
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe Connect POST error:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data: farm } = await service
      .from("farms")
      .select("id, stripe_account_id")
      .eq("owner_id", user.id)
      .single();

    if (!farm?.stripe_account_id) {
      return NextResponse.json(
        { error: "No Stripe account found. Create one first via POST." },
        { status: 400 }
      );
    }

    // Create a fresh Account Link for re-entry
    const accountLink = await stripe.accountLinks.create({
      account: farm.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/connect/account?refresh=1`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?stripe_onboarding=complete`,
      type: "account_onboarding",
      collection_options: { fields: "eventually_due" },
    });

    // If this is the refresh flow, redirect directly
    const isRefresh = request.nextUrl.searchParams.get("refresh");
    if (isRefresh) {
      return NextResponse.redirect(accountLink.url);
    }

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe Connect GET error:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
