"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionPopup } from "./ActionPopup";

type Props = {
  deleteAction: () => Promise<void>;
};

export function CancelledActions({ deleteAction }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDelete = () => {
    startTransition(async () => {
      try {
        await deleteAction();
        router.push("/admin/reservas");
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
        onClick={() => setConfirmDeleteOpen(true)}
        className="w-full sm:w-auto rounded-full bg-rose/70 text-ink tracking-label text-[11px] px-5 py-2 hover:bg-rose transition disabled:opacity-40"
      >
        {pending ? "Borrando…" : "Borrar del historial"}
      </button>

      <ActionPopup
        open={confirmDeleteOpen}
        title="Eliminar del historial"
        description="Esta reserva cancelada se eliminará de forma permanente."
        confirmLabel={pending ? "Borrando…" : "Sí, eliminar"}
        cancelLabel="Volver"
        tone="danger"
        pending={pending}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          onDelete();
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
