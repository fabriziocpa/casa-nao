"use client";

import { useState, useTransition } from "react";
import { ActionPopup } from "./ActionPopup";

type Props = {
  confirmAction: () => Promise<void>;
  rejectAction: () => Promise<void>;
};

export function PendingActions({ confirmAction, rejectAction }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setErrorMessage(toUserMessage(e));
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className="w-full sm:w-auto rounded-full bg-teal text-white tracking-label text-[11px] px-5 py-2 hover:bg-deep-ocean transition disabled:opacity-40"
        >
          {pending ? "Procesando…" : "Confirmar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setRejectOpen(true)}
          className="w-full sm:w-auto rounded-full bg-rose/70 text-ink tracking-label text-[11px] px-5 py-2 hover:bg-rose transition disabled:opacity-40"
        >
          {pending ? "Procesando…" : "Rechazar"}
        </button>
      </div>

      <ActionPopup
        open={confirmOpen}
        title="Confirmar reserva"
        description="Se confirmará la solicitud y se bloquearán automáticamente sus fechas en el calendario."
        confirmLabel={pending ? "Confirmando…" : "Sí, confirmar"}
        cancelLabel="Volver"
        tone="teal"
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          run(confirmAction);
        }}
      />
      <ActionPopup
        open={rejectOpen}
        title="Rechazar solicitud"
        description="La solicitud pasará a estado rechazada y no bloqueará fechas."
        confirmLabel={pending ? "Procesando…" : "Sí, rechazar"}
        cancelLabel="Volver"
        tone="danger"
        pending={pending}
        onClose={() => setRejectOpen(false)}
        onConfirm={() => {
          setRejectOpen(false);
          run(rejectAction);
        }}
      />
      <ActionPopup
        open={Boolean(errorMessage)}
        title="No se pudo completar"
        description={errorMessage ?? ""}
        confirmLabel="Entendido"
        tone="default"
        onClose={() => setErrorMessage(null)}
        onConfirm={() => setErrorMessage(null)}
      />
    </div>
  );
}

function toUserMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    if (error.message.includes("bloqueadas") || error.message.includes("ocupadas")) {
      return "No se pudo confirmar: las fechas ya están ocupadas o bloqueadas.";
    }
    return error.message;
  }
  return "No se pudo completar la acción. Inténtalo nuevamente.";
}
