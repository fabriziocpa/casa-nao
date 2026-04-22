"use client";

import { useMemo, useState } from "react";
import { formatUSDPrecise } from "@/lib/money";

type Mode = "manual" | "discount";

type RuleDefaults = {
  id?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  nightlyCents?: number;
  minNights?: number | null;
  priority?: number;
  active?: boolean;
};

type Props = {
  action: (fd: FormData) => Promise<void> | void;
  rule?: RuleDefaults;
  baseNightlyCents: number;
  submitLabel: string;
};

const inputCls = "w-full h-9 rounded-md border border-line px-3 text-sm bg-white";

export function RuleForm({ action, rule, baseNightlyCents, submitLabel }: Props) {
  const [mode, setMode] = useState<Mode>("manual");
  const [roundToInt, setRoundToInt] = useState(false);
  const [discountPct, setDiscountPct] = useState<string>("10");
  const [nightlyDollars, setNightlyDollars] = useState<string>(
    rule?.nightlyCents != null ? String(rule.nightlyCents / 100) : "",
  );

  const previewCents = useMemo(
    () => computeCents({ mode, roundToInt, discountPct, nightlyDollars, baseNightlyCents }),
    [mode, roundToInt, discountPct, nightlyDollars, baseNightlyCents],
  );

  const baseDollars = baseNightlyCents / 100;

  return (
    <form
      action={action}
      className="grid gap-3 md:grid-cols-6 rounded-xl border border-line bg-white/60 p-4"
    >
      {rule?.id ? <input type="hidden" name="id" value={rule.id} /> : null}

      <label className="md:col-span-2 block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Nombre</span>
        <input name="name" defaultValue={rule?.name ?? ""} required className={inputCls} />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Inicio</span>
        <input
          name="startDate"
          type="date"
          defaultValue={rule?.startDate ?? ""}
          required
          className={inputCls}
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Fin</span>
        <input
          name="endDate"
          type="date"
          defaultValue={rule?.endDate ?? ""}
          required
          className={inputCls}
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Min noches</span>
        <input
          name="minNights"
          type="number"
          defaultValue={rule?.minNights ?? ""}
          className={inputCls}
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Prioridad</span>
        <input
          name="priority"
          type="number"
          defaultValue={rule?.priority ?? 100}
          className={inputCls}
        />
      </label>

      <fieldset className="md:col-span-6 space-y-2 rounded-md border border-line bg-sand/30 p-3">
        <legend className="tracking-label text-[11px] text-ink/60 px-1">
          Cómo definir la tarifa
        </legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="manual"
              checked={mode === "manual"}
              onChange={() => setMode("manual")}
            />
            Precio manual
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="discount"
              checked={mode === "discount"}
              onChange={() => setMode("discount")}
            />
            % descuento sobre base ({formatUSDPrecise(baseNightlyCents)})
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {mode === "manual" ? (
            <label className="block space-y-1">
              <span className="tracking-label text-[11px] text-ink/60">USD / noche</span>
              <input
                name="nightlyDollars"
                type="number"
                step="0.01"
                min="1"
                value={nightlyDollars}
                onChange={(e) => setNightlyDollars(e.target.value)}
                required
                className={inputCls}
              />
            </label>
          ) : (
            <label className="block space-y-1">
              <span className="tracking-label text-[11px] text-ink/60">% descuento</span>
              <input
                name="discountPct"
                type="number"
                step="1"
                min="1"
                max="99"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                required
                className={inputCls}
              />
            </label>
          )}
          <label className="md:col-span-2 inline-flex items-center gap-2 text-sm pt-5">
            <input
              type="checkbox"
              name="roundToInteger"
              checked={roundToInt}
              onChange={(e) => setRoundToInt(e.target.checked)}
            />
            Redondear a dólares enteros
          </label>
        </div>

        <p className="text-xs text-ink/70">
          Tarifa resultante:{" "}
          <span className="font-display text-base text-ink">
            {previewCents != null ? formatUSDPrecise(previewCents) : "—"}
          </span>
          {mode === "discount" && previewCents != null && baseDollars > 0 ? (
            <span className="text-ink/50">
              {" "}
              · ahorras {formatUSDPrecise(baseNightlyCents - previewCents)} vs. base
            </span>
          ) : null}
        </p>
      </fieldset>

      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={rule?.active ?? true} />
        Activa
      </label>

      <div className="md:col-span-6">
        <button className="rounded-md bg-ink text-bg tracking-label text-[11px] px-4 py-2">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function computeCents({
  mode,
  roundToInt,
  discountPct,
  nightlyDollars,
  baseNightlyCents,
}: {
  mode: Mode;
  roundToInt: boolean;
  discountPct: string;
  nightlyDollars: string;
  baseNightlyCents: number;
}): number | null {
  if (mode === "discount") {
    const pct = Number(discountPct);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100 || !baseNightlyCents) return null;
    const cents = baseNightlyCents * (1 - pct / 100);
    return roundToInt ? Math.round(cents / 100) * 100 : Math.round(cents);
  }
  const usd = Number(nightlyDollars);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  return roundToInt ? Math.round(usd) * 100 : Math.round(usd * 100);
}
