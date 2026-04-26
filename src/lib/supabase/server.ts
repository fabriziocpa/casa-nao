import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/auth/admin-allowlist";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof cookieStore.set>[2];
  };
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            throw new Error(
              "Failed to persist Supabase auth cookies. Use mutable cookies (Server Actions or Route Handlers) when auth can refresh.",
              { cause: error },
            );
          }
        },
      },
    },
  );
}

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { user: null, isAdmin: false as const };
  const isAdmin = isAdminEmail(user.email);
  return { user, isAdmin };
}
