import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const type = searchParams.get("type"); // 'recovery' for password reset emails
  const role = searchParams.get("role"); // 'customer' passed via redirectTo

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/farmer/reset-password`);
      }

      // Explicit customer flow
      if (role === "customer") {
        return NextResponse.redirect(`${origin}${next ?? "/account/orders"}`);
      }

      // Explicit next param (e.g. middleware redirect)
      if (next && next !== "/farmer/reset-password") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Determine where to send the user based on their role + farm status
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Use service client so RLS never blocks these lookups
        const service = createServiceClient();

        const { data: profile } = await service
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "farmer") {
          const { data: farm } = await service
            .from("farms")
            .select("id, name")
            .eq("owner_id", user.id)
            .single();

          // Farmer with no farm yet — send to setup
          if (!farm) {
            return NextResponse.redirect(`${origin}/farmer/setup`);
          }

          return NextResponse.redirect(`${origin}/dashboard`);
        }

        // Customer or unknown — send to account
        return NextResponse.redirect(`${origin}/account/orders`);
      }
    }
  }

  return NextResponse.redirect(
    `${origin}/farmer/login?error=${encodeURIComponent("The link has expired or is invalid. Please try again.")}`
  );
}
