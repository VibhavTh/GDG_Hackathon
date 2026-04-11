import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/account/orders";

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?role=customer&next=${encodeURIComponent(next)}`;

  // We need a placeholder response to collect cookies onto before we know the final URL.
  // Supabase sets the PKCE code verifier cookie during signInWithOAuth — it must travel
  // to the browser on this same response, otherwise exchangeCodeForSession will fail.
  let oauthUrl: string | null = null;
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      scopes: "email profile",
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL(`/customer/login?error=${encodeURIComponent("Google sign-in failed. Please try again.")}`, request.url)
    );
  }

  oauthUrl = data.url;

  // Build the redirect response and attach any cookies Supabase wants to set
  const response = NextResponse.redirect(oauthUrl);
  for (const { name, value, options } of cookiesToSet) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.cookies.set(name, value, options as any);
  }

  return response;
}
