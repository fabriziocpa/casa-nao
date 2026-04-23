import type { Metadata } from "next";
import { Logo } from "@/components/logos";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Acceso" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo } = await searchParams;
  const errorMessage =
    error === "not_allowed"
      ? "Este correo no tiene acceso al panel."
      : error === "invalid_link"
        ? "El enlace expiró o ya fue usado."
        : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo className="h-[72px] w-[220px] text-ink" />
        </div>
        <div className="text-center space-y-2">
          <p className="tracking-label text-xs text-ink/60">
            Acceso administrador
          </p>
          <h1 className="text-2xl font-display">Bienvenida</h1>
          <p className="text-sm text-ink/70">
            Ingresa tu correo y contraseña para acceder al panel.
          </p>
        </div>
        {errorMessage ? (
          <p className="text-sm text-rose-700 bg-rose/30 border border-rose/40 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        ) : null}
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
