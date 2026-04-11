import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  const role = searchParams.get("role");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies);
        },
      },
    }
  );

  function redirectWith(path: string) {
    const response = NextResponse.redirect(`${siteUrl}${path}`);
    for (const { name, value, options } of cookiesToSet) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.cookies.set(name, value, options as any);
    }
    return response;
  }

  if (!code && !(tokenHash && type)) {
    return redirectWith(`/vendor/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`);
  }

  let authError: Error | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    authError = error;
  }

  if (authError) {
    return redirectWith(`/vendor/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`);
  }

  if (type === "recovery") {
    return redirectWith("/vendor/reset-password");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirectWith(`/vendor/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`);
  }

  const service = createServiceClient();

  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const FARM_OWNER_EMAIL = process.env.FARM_OWNER_EMAIL;
  const isFarmOwner = FARM_OWNER_EMAIL
    ? user.email?.toLowerCase() === FARM_OWNER_EMAIL.toLowerCase()
    : false;

  if (!profile) {
    await service.from("users").insert({
      id: user.id,
      email: user.email!,
      role: isFarmOwner ? "farmer" : "customer",
    });
  } else if (isFarmOwner && profile.role !== "farmer" && profile.role !== "admin") {
    await service.from("users").update({ role: "farmer" }).eq("id", user.id);
  }

  const userRole = isFarmOwner ? (profile?.role ?? "farmer") : (profile?.role ?? "customer");

  if (role === "customer") {
    return redirectWith(next ?? "/account");
  }

  if (next) {
    return redirectWith(next);
  }

  if (userRole === "farmer" || userRole === "admin") {
    return redirectWith("/dashboard");
  }

  return redirectWith("/account");
}
