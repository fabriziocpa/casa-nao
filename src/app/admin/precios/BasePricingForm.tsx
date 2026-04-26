"use client";

import { useActionState } from "react";
import {
  upsertBasePricing,
  type BasePricingFormState,
} from "@/features/pricing-rules/actions";
import type { BasePricingInput } from "@/features/reservations/pricing";

const inputCls =
  "w-full h-10 rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal";

export function BasePricingForm({ base }: { base: BasePricingInput }) {
  const [state, action, pending] = useActionState<BasePricingFormState, FormData>(
    upsertBasePricing,
    null,
  );
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  const errMsg = state && !state.ok ? state.error : null;
  const okMsg = state && state.ok ? "Tarifa base actualizada." : null;

  return (
    <form action={action} className="grid gap-4 md:grid-cols-3">
      <label className="block space-y-1.5">
        <span className="tracking-label text-[11px] text-ink/70">Tarifa base (USD/noche)</span>
        <input
          name="nightlyDollars"
          type="number"
          step="0.01"
          min="1"
          required
          defaultValue={base.nightlyCents / 100}
          className={inputCls}
        />
        {fe.nightlyDollars ? (
          <span className="block text-xs text-rose-700">{fe.nightlyDollars}</span>
        ) : null}
      </label>
      <label className="block space-y-1.5">
        <span className="tracking-label text-[11px] text-ink/70">Mínimo de noches</span>
        <input
          name="minNights"
          type="number"
          min={1}
          required
          defaultValue={base.minNights}
          className={inputCls}
        />
        {fe.minNights ? (
          <span className="block text-xs text-rose-700">{fe.minNights}</span>
        ) : null}
      </label>
      <label className="block space-y-1.5">
        <span className="tracking-label text-[11px] text-ink/70">Capacidad máxima</span>
        <input
          name="maxGuests"
          type="number"
          min={1}
          required
          defaultValue={base.maxGuests}
          className={inputCls}
        />
        {fe.maxGuests ? (
          <span className="block text-xs text-rose-700">{fe.maxGuests}</span>
        ) : null}
      </label>
      <div className="md:col-span-3 flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-full bg-ink text-bg tracking-label text-[11px] px-5 py-2.5 hover:bg-deep-ocean transition disabled:opacity-40"
        >
          {pending ? "Guardando…" : "Guardar tarifa base"}
        </button>
        {errMsg ? <span className="text-xs text-rose-700">{errMsg}</span> : null}
        {okMsg ? <span className="text-xs text-emerald-700">{okMsg}</span> : null}
      </div>
    </form>
  );
}
