"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { getAdminEmails, isAdminEmail } from "@/lib/auth/admin-allowlist";

const credentialsSchema = z.object({
  email: z.string().trim().max(254).email(),
  password: z.string().min(1).max(128),
  redirectTo: z.string().max(2048).optional(),
});

export type LoginState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

const LOGIN_RATE_LIMIT_ERROR = "Demasiados intentos. Intenta nuevamente en unos minutos.";

function safeRedirectPath(path: string | undefined) {
  if (!path) return "/admin";
  if (!path.startsWith("/") || path.startsWith("//")) return "/admin";
  return path;
}

async function getClientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function signInWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  });
  if (!parsed.success) return { ok: false, error: "Credenciales inválidas." };

  const email = parsed.data.email.toLowerCase();
  const ip = await getClientIp();
  const [ipRate, emailRate] = await Promise.all([
    checkLoginRateLimit(`ip:${ip}`),
    checkLoginRateLimit(`email:${email}`),
  ]);
  if (!ipRate.success || !emailRate.success) {
    return { ok: false, error: LOGIN_RATE_LIMIT_ERROR };
  }

  const allow = getAdminEmails();
  if (!allow.includes(email)) {
    return { ok: false, error: "Credenciales inválidas." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error || !data.user) return { ok: false, error: "Credenciales inválidas." };

  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return { ok: false, error: "Credenciales inválidas." };
  }

  redirect(safeRedirectPath(parsed.data.redirectTo));
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
