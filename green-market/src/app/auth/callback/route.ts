import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  const role = searchParams.get("role"); // 'customer' passed via redirectTo

  const supabase = await createClient();
  let authError: Error | null = null;

  if (code) {
    // OAuth / PKCE code exchange
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (tokenHash && type) {
    // Email OTP / magic link / confirmation link
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    authError = error;
  } else {
    return NextResponse.redirect(
      `${origin}/farmer/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`
    );
  }

  if (authError) {
    return NextResponse.redirect(
      `${origin}/farmer/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`
    );
  }

  // Password reset
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/farmer/reset-password`);
  }

  // Get the authenticated user for all flows below
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/farmer/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`
    );
  }

  const service = createServiceClient();

  // Ensure a users row exists for this user (Google OAuth and magic link don't create one)
  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // New user via OAuth or magic link -- default to customer
    await service.from("users").insert({
      id: user.id,
      email: user.email!,
      role: "customer",
    });
  }

  const userRole = profile?.role ?? "customer";

  // Explicit customer flow (Google OAuth, magic link)
  if (role === "customer") {
    return NextResponse.redirect(`${origin}${next ?? "/account"}`);
  }

  // Explicit next param (honored for all flows, including PKCE recovery)
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Route based on role + farm status
  if (userRole === "farmer") {
    const { data: farm } = await service
      .from("farms")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    if (!farm) {
      return NextResponse.redirect(`${origin}/farmer/setup`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Customer or unknown -- send to account
  return NextResponse.redirect(`${origin}/account`);
}
