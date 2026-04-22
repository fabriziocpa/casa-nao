"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PhoneInput } from "./PhoneInput";
import { ActionPopup } from "./ActionPopup";

type Props = {
  reservationId: string;
  defaults: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    guests: number;
    message: string;
  };
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
};

const inputCls =
  "w-full h-9 rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal";

export function RejectedActions({
  defaults,
  updateAction,
  deleteAction,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="w-full sm:w-auto rounded-full border border-line tracking-label text-[11px] px-5 py-2 hover:bg-sand/40 transition"
        >
          {editing ? "Cerrar edición" : "Editar solicitud"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmDeleteOpen(true)}
          disabled={pending}
          className="w-full sm:w-auto rounded-full bg-rose/70 text-ink tracking-label text-[11px] px-5 py-2 hover:bg-rose transition disabled:opacity-40"
        >
          {pending ? "Borrando…" : "Borrar solicitud"}
        </button>
      </div>

      {editing ? (
        <form action={updateAction} className="grid gap-3 md:grid-cols-2 border-t border-line pt-4">
          <label className="block space-y-1">
            <span className="tracking-label text-[11px] text-ink/60">Nombres</span>
            <input name="firstName" defaultValue={defaults.firstName} className={inputCls} required />
          </label>
          <label className="block space-y-1">
            <span className="tracking-label text-[11px] text-ink/60">Apellidos</span>
            <input name="lastName" defaultValue={defaults.lastName} className={inputCls} required />
          </label>
          <label className="block space-y-1">
            <span className="tracking-label text-[11px] text-ink/60">Correo</span>
            <input name="email" type="email" defaultValue={defaults.email} className={inputCls} required />
          </label>
          <label className="block space-y-1">
            <span className="tracking-label text-[11px] text-ink/60">Celular</span>
            <PhoneInput inputClassName={inputCls} defaultValue={defaults.phone} />
          </label>
          <label className="block space-y-1">
            <span className="tracking-label text-[11px] text-ink/60">Huéspedes</span>
            <input
              name="guests"
              type="number"
              min={1}
              max={15}
              defaultValue={defaults.guests}
              className={inputCls}
              required
            />
          </label>
          <label className="md:col-span-2 block space-y-1">
            <span className="tracking-label text-[11px] text-ink/60">Mensaje</span>
            <textarea
              name="message"
              defaultValue={defaults.message}
              rows={3}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
          <div className="md:col-span-2">
            <button className="rounded-md bg-ink text-bg tracking-label text-[11px] px-4 py-2">
              Guardar cambios
            </button>
          </div>
        </form>
      ) : null}

      <ActionPopup
        open={confirmDeleteOpen}
        title="Eliminar del historial"
        description="Esta solicitud rechazada se eliminará de forma permanente."
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
    </div>
  );
}

function toUserMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "No se pudo completar la acción. Inténtalo nuevamente.";
}
