"use client";

import { useState, useTransition } from "react";

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
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-full border border-line tracking-label text-[11px] px-5 py-2 hover:bg-sand/40 transition"
        >
          {editing ? "Cerrar edición" : "Editar solicitud"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="rounded-full bg-rose/70 text-ink tracking-label text-[11px] px-5 py-2 hover:bg-rose transition"
        >
          Borrar solicitud
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
            <input name="phone" defaultValue={defaults.phone} className={inputCls} required />
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

      {confirmingDelete ? (
        <div className="rounded-md border border-rose/50 bg-rose/10 p-4 space-y-3">
          <p className="text-sm text-ink">
            ¿Seguro que deseas borrar esta solicitud rechazada? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteAction();
                })
              }
              className="rounded-full bg-rose text-ink tracking-label text-[11px] px-5 py-2 disabled:opacity-40"
            >
              {pending ? "Borrando…" : "Sí, borrar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={pending}
              className="rounded-full border border-line tracking-label text-[11px] px-5 py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
