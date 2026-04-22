"use client";

import { useState, useTransition } from "react";
import { ActionPopup } from "./ActionPopup";

type Props = {
  cancelAction: () => Promise<void>;
};

export function ConfirmedActions({ cancelAction }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onCancel = () => {
    startTransition(async () => {
      try {
        await cancelAction();
      } catch (error) {
        setErrorMessage(toUserMessage(error));
      }
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
        className="w-full sm:w-auto rounded-full bg-ink/80 text-bg tracking-label text-[11px] px-5 py-2 hover:bg-ink transition disabled:opacity-40"
      >
        {pending ? "Cancelando…" : "Cancelar reserva"}
      </button>

      <ActionPopup
        open={confirmOpen}
        title="Cancelar reserva"
        description="La reserva quedará en estado cancelada y se liberarán sus fechas."
        confirmLabel={pending ? "Cancelando…" : "Sí, cancelar"}
        cancelLabel="Volver"
        tone="danger"
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onCancel();
        }}
      />
      <ActionPopup
        open={Boolean(errorMessage)}
        title="No se pudo completar"
        description={errorMessage ?? ""}
        confirmLabel="Entendido"
        onClose={() => setErrorMessage(null)}
        onConfirm={() => setErrorMessage(null)}
      />
    </>
  );
}

function toUserMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "No se pudo completar la acción. Inténtalo nuevamente.";
}
