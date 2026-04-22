"use client";

import { useState, useTransition } from "react";

type Props = {
  cancelAction: () => Promise<void>;
};

export function ConfirmedActions({ cancelAction }: Props) {
  const [confirmStep, setConfirmStep] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {!confirmStep ? (
        <button
          type="button"
          onClick={() => setConfirmStep(true)}
          className="rounded-full bg-ink/80 text-bg tracking-label text-[11px] px-5 py-2 hover:bg-ink transition"
        >
          Cancelar reserva
        </button>
      ) : (
        <div className="rounded-md border border-rose/50 bg-rose/10 p-4 space-y-3">
          <p className="text-sm text-ink">
            ¿Confirmas la cancelación de esta reserva? Las fechas se liberarán del calendario.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await cancelAction();
                })
              }
              className="rounded-full bg-rose text-ink tracking-label text-[11px] px-5 py-2 disabled:opacity-40"
            >
              {pending ? "Cancelando…" : "Sí, cancelar reserva"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmStep(false)}
              className="rounded-full border border-line tracking-label text-[11px] px-5 py-2"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
