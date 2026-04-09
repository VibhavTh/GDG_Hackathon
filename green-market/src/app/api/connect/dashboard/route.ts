import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export async function GET() {
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
    .select("stripe_account_id")
    .eq("owner_id", user.id)
    .single();

  if (!farm?.stripe_account_id) {
    return NextResponse.json(
      { error: "No Stripe account connected" },
      { status: 400 }
    );
  }

  const loginLink = await stripe.accounts.createLoginLink(
    farm.stripe_account_id
  );

  return NextResponse.redirect(loginLink.url);
}
