import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const type = searchParams.get("type"); // 'recovery' for password reset emails
  const role = searchParams.get("role"); // 'customer' for customer auth flows

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset — send straight to the reset form
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/farmer/reset-password`);
      }

      // Customer flow — go to next or orders page
      if (role === "customer") {
        return NextResponse.redirect(`${origin}${next ?? "/account/orders"}`);
      }

      // Explicit next param
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Farmer flow — check if farm setup is needed
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: farm } = await supabase
          .from("farms")
          .select("id")
          .eq("owner_id", user.id)
          .single();

        // No farm row yet — could be a new farmer or a customer
        if (!farm) {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile?.role === "farmer") {
            return NextResponse.redirect(`${origin}/farmer/setup`);
          }
          return NextResponse.redirect(`${origin}/account/orders`);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(
    `${origin}/farmer/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`
  );
}
