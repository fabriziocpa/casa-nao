"use client";

import { formatUSD, formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import type { StayCalc } from "../pricing";

export function StaySummary({ stay }: { stay: StayCalc | null }) {
  if (!stay || stay.nights === 0) {
    return (
      <aside className="rounded-2xl border border-line bg-white/70 p-6 space-y-3">
        <p className="tracking-label text-xs text-ink/60">Resumen</p>
        <p className="text-ink/60 text-sm">
          Selecciona fechas en el calendario para ver el total de tu estadía.
        </p>
      </aside>
    );
  }

  const tooShort = stay.nights < stay.minNightsRequired;

  return (
    <aside className="rounded-2xl border border-line bg-white/70 p-6 space-y-4">
      <p className="tracking-label text-xs text-ink/60">Resumen</p>

      <ul className="space-y-1.5 text-sm">
        {stay.breakdown.map((n) => (
          <li key={n.date} className="flex justify-between text-ink/80">
            <span className="capitalize">{formatEs(n.date, "EEE d MMM")}</span>
            <span>{formatUSD(n.cents)}</span>
          </li>
        ))}
      </ul>

      {stay.appliedRuleNames.length > 0 ? (
        <p className="text-xs text-ink/60">
          Tarifa de temporada aplicada: {stay.appliedRuleNames.join(", ")}.
        </p>
      ) : null}

      <div className="border-t border-line pt-3 flex justify-between items-baseline">
        <span className="tracking-label text-xs text-ink/70">
          Total · {stay.nights} noches
        </span>
        <span className="font-display text-2xl">{formatUSDPrecise(stay.totalCents)}</span>
      </div>

      {tooShort ? (
        <p className="text-sm text-rose-700 bg-rose/25 border border-rose/40 rounded-md px-3 py-2">
          La temporada seleccionada requiere mínimo {stay.minNightsRequired} noches.
        </p>
      ) : null}

      <p className="text-[11px] text-ink/50">
        Pagos por transferencia, Yape o Plin al confirmar la reserva.
      </p>
    </aside>
  );
}
