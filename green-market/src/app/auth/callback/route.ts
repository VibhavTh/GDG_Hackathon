import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const type = searchParams.get("type"); // 'recovery' for password reset emails

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset link — send to the reset password form
      if (type === "recovery" || next === "/farmer/reset-password") {
        return NextResponse.redirect(`${origin}/farmer/reset-password`);
      }

      // Explicit next param (e.g. from middleware redirect)
      if (next && next !== "/farmer/reset-password") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // New farmer — check if onboarding is needed
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: farm } = await supabase
          .from("farms")
          .select("description, location")
          .eq("owner_id", user.id)
          .single();

        if (farm && !farm.description && !farm.location) {
          return NextResponse.redirect(`${origin}/farmer/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(
    `${origin}/farmer/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`
  );
}
