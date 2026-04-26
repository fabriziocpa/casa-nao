import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/auth/admin-allowlist";

const LOGIN_PATH = "/auth/login";
const ADMIN_PATH_PREFIX = "/admin";

function safeRedirectPath(path: string | null | undefined) {
  if (!path) return ADMIN_PATH_PREFIX;
  if (!path.startsWith("/") || path.startsWith("//")) return ADMIN_PATH_PREFIX;
  return path;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith(ADMIN_PATH_PREFIX);
  const isLoginRoute = pathname === LOGIN_PATH;

  if (!isAdminRoute && !isLoginRoute) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof response.cookies.set>[2];
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isLoginRoute) {
    if (isAdminEmail(user?.email)) {
      const target = safeRedirectPath(request.nextUrl.searchParams.get("redirectTo"));
      return NextResponse.redirect(new URL(target, request.url));
    }
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("redirectTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (!isAdminEmail(user.email)) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("error", "not_allowed");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/login"],
};
