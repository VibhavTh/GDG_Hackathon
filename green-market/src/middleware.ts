import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const FARMER_PROTECTED_PREFIXES = [
  "/dashboard",
  "/orders",
  "/inventory",
  "/settings",
  "/farmer/onboarding",
];

const CUSTOMER_PROTECTED_PREFIXES = ["/account/orders"];

const PROTECTED_PREFIXES = [
  ...FARMER_PROTECTED_PREFIXES,
  ...CUSTOMER_PROTECTED_PREFIXES,
];

// Routes a logged-in farmer should not see
const AUTH_PREFIXES = ["/farmer/login", "/farmer/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  // Skip Supabase entirely for routes that never need auth checks
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated user hitting a protected route -> appropriate login
  if (isProtected && !user) {
    const isCustomerRoute = CUSTOMER_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const loginPath = isCustomerRoute ? "/customer/login" : "/farmer/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated farmer hitting login/register -> dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
