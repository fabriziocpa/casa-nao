"use client";

import { useState, useTransition } from "react";

type Props = {
  confirmAction: () => Promise<void>;
  rejectAction: () => Promise<void>;
};

export function PendingActions({ confirmAction, rejectAction }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      setError(null);
      try {
        await action();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(confirmAction)}
          className="rounded-full bg-teal text-white tracking-label text-[11px] px-5 py-2 hover:bg-deep-ocean transition disabled:opacity-40"
        >
          {pending ? "Procesando…" : "Confirmar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(rejectAction)}
          className="rounded-full bg-rose/70 text-ink tracking-label text-[11px] px-5 py-2 hover:bg-rose transition disabled:opacity-40"
        >
          {pending ? "Procesando…" : "Rechazar"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-rose-700 bg-rose/25 border border-rose/40 rounded-md px-3 py-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function toUserMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    if (error.message.includes("bloqueadas")) {
      return "No se pudo confirmar: las fechas ya están ocupadas o bloqueadas.";
    }
    return error.message;
  }
  return "No se pudo completar la acción. Inténtalo nuevamente.";
}
