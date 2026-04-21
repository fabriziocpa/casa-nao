"use client";

import { useActionState } from "react";
import { signInWithPassword, type LoginState } from "@/features/auth/actions";

const initial: LoginState = null;

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(signInWithPassword, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/admin"} />
      <label className="block space-y-2">
        <span className="tracking-label text-xs text-ink/70">Correo</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="tu@correo.com"
        />
      </label>
      <label className="block space-y-2">
        <span className="tracking-label text-xs text-ink/70">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="••••••••"
        />
      </label>
      {state && !state.ok ? (
        <p className="text-sm text-rose-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-ink text-bg tracking-label text-xs py-3 hover:bg-deep-ocean transition disabled:opacity-50"
      >
        {pending ? "Ingresando…" : "Entrar"}
      </button>
    </form>
  );
}
