"use client";

import { useActionState, useMemo, useState } from "react";
import { formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type {
  PricingRuleConflict,
  PricingRuleFormState,
} from "@/features/pricing-rules/actions";

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
  kind?: Mode;
  discountPct?: number | null;
};

type Props = {
  action: (
    prev: PricingRuleFormState,
    fd: FormData,
  ) => Promise<PricingRuleFormState>;
  rule?: RuleDefaults;
  baseNightlyCents: number;
  submitLabel: string;
};

const inputCls =
  "w-full h-10 rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal";

export function RuleForm({ action, rule, baseNightlyCents, submitLabel }: Props) {
  const initialMode: Mode = rule?.kind ?? "manual";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [discountPct, setDiscountPct] = useState<string>(
    rule?.discountPct != null ? String(rule.discountPct) : "10",
  );
  const [nightlyDollars, setNightlyDollars] = useState<string>(
    rule?.nightlyCents != null ? String(rule.nightlyCents / 100) : "",
  );
  const [state, formAction, pending] = useActionState<PricingRuleFormState, FormData>(
    action,
    null,
  );

  const previewCents = useMemo(
    () => computeCents({ mode, discountPct, nightlyDollars, baseNightlyCents }),
    [mode, discountPct, nightlyDollars, baseNightlyCents],
  );

  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  const errMsg = state && !state.ok ? state.error : null;
  const warnings = state && state.ok ? state.warnings : [];
  const successMsg = state && state.ok ? "Cambios guardados." : null;

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-line bg-white/70 p-6"
    >
      {rule?.id ? <input type="hidden" name="id" value={rule.id} /> : null}

      <PreviewCard
        mode={mode}
        previewCents={previewCents}
        baseCents={baseNightlyCents}
        discountPct={Number(discountPct)}
      />

      <div className="space-y-4">
        <h3 className="tracking-label text-[11px] text-ink/60">Datos de la temporada</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nombre de la temporada" className="md:col-span-3" error={fe.name}>
            <input
              name="name"
              defaultValue={rule?.name ?? ""}
              required
              placeholder="Ej. Temporada alta verano"
              className={inputCls}
            />
          </Field>
          <Field label="Desde" error={fe.startDate}>
            <input
              name="startDate"
              type="date"
              defaultValue={rule?.startDate ?? ""}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Hasta" error={fe.endDate}>
            <input
              name="endDate"
              type="date"
              defaultValue={rule?.endDate ?? ""}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Mínimo de noches (opcional)" hint="Déjalo vacío para usar el mínimo general">
            <input
              name="minNights"
              type="number"
              min={1}
              defaultValue={rule?.minNights ?? ""}
              placeholder="—"
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="tracking-label text-[11px] text-ink/60">Cómo definir la tarifa</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            selected={mode === "manual"}
            onSelect={() => setMode("manual")}
            title="Precio fijo"
            subtitle="Tú defines el monto por noche"
            name="mode"
            value="manual"
          />
          <ModeCard
            selected={mode === "discount"}
            onSelect={() => setMode("discount")}
            title="Descuento sobre tarifa base"
            subtitle={
              baseNightlyCents > 0
                ? `Aplica un % sobre ${formatUSDPrecise(baseNightlyCents)}`
                : "Configura primero la tarifa base"
            }
            name="mode"
            value="discount"
            disabled={baseNightlyCents <= 0}
          />
        </div>

        <div className="max-w-sm">
          {mode === "manual" ? (
            <Field label="Precio por noche (USD)" error={fe.nightlyDollars}>
              <input
                name="nightlyDollars"
                type="number"
                step="0.01"
                min="1"
                value={nightlyDollars}
                onChange={(e) => setNightlyDollars(e.target.value)}
                required
                placeholder="Ej. 250"
                className={inputCls}
              />
            </Field>
          ) : (
            <Field label="Porcentaje de descuento" error={fe.discountPct}>
              <div className="relative">
                <input
                  name="discountPct"
                  type="number"
                  step="1"
                  min="1"
                  max="99"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  required
                  className={cn(inputCls, "pr-9")}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink/50 text-sm">
                  %
                </span>
              </div>
            </Field>
          )}
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer list-none tracking-label text-[11px] text-ink/60 hover:text-ink">
          <span className="inline-block transition group-open:rotate-90">›</span>{" "}
          Opciones avanzadas
        </summary>
        <div className="pt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Prioridad"
            hint="Si dos temporadas se superponen, gana la de mayor prioridad"
          >
            <input
              name="priority"
              type="number"
              defaultValue={rule?.priority ?? 100}
              className={inputCls}
            />
          </Field>
          <Field label="Estado">
            <label className="flex items-center gap-2 h-10 text-sm text-ink/80">
              <input type="checkbox" name="active" defaultChecked={rule?.active ?? true} />
              Temporada activa
            </label>
          </Field>
        </div>
      </details>

      {warnings.length > 0 ? <ConflictsCallout conflicts={warnings} /> : null}
      {errMsg ? (
        <p className="text-sm text-rose-700 bg-rose/25 border border-rose/40 rounded-md px-3 py-2">
          {errMsg}
        </p>
      ) : null}
      {successMsg && warnings.length === 0 ? (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          {successMsg}
        </p>
      ) : null}

      <div className="pt-2 border-t border-line">
        <button
          disabled={pending}
          className="rounded-full bg-ink text-bg tracking-label text-[11px] px-6 py-3 hover:bg-deep-ocean transition disabled:opacity-40"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function PreviewCard({
  mode,
  previewCents,
  baseCents,
  discountPct,
}: {
  mode: Mode;
  previewCents: number | null;
  baseCents: number;
  discountPct: number;
}) {
  const savings =
    previewCents != null && baseCents > previewCents
      ? baseCents - previewCents
      : 0;
  const isDiscountMode = mode === "discount";
  const validPct = Number.isFinite(discountPct) && discountPct > 0 && discountPct < 100;

  return (
    <div className="rounded-lg bg-gradient-to-br from-sand/60 to-sand/20 border border-line p-5 flex items-start justify-between gap-4 flex-wrap">
      <div className="space-y-1">
        <p className="tracking-label text-[11px] text-ink/60">
          {isDiscountMode ? "Descuento sobre tarifa base" : "Precio fijo por noche"}
        </p>
        {isDiscountMode ? (
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-ink/50 line-through text-lg">
              {baseCents > 0 ? formatUSDPrecise(baseCents) : "—"}
            </span>
            <span className="font-display text-4xl text-ink">
              {previewCents != null ? formatUSDPrecise(previewCents) : "—"}
            </span>
            {validPct ? (
              <span className="rounded-full bg-emerald-600/10 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                –{Math.round(discountPct)}%
              </span>
            ) : null}
          </div>
        ) : (
          <p className="font-display text-4xl text-ink">
            {previewCents != null ? formatUSDPrecise(previewCents) : "—"}
          </p>
        )}
        <p className="text-xs text-ink/60">
          por noche
          {savings > 0 && !isDiscountMode
            ? ` · ahorro de ${formatUSDPrecise(savings)} vs tarifa base`
            : null}
          {savings > 0 && isDiscountMode
            ? ` · ahorras ${formatUSDPrecise(savings)} por noche`
            : null}
        </p>
      </div>
    </div>
  );
}

function ConflictsCallout({ conflicts }: { conflicts: PricingRuleConflict[] }) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
      <p className="text-sm font-medium text-amber-900">
        Conflictos detectados con otras temporadas activas
      </p>
      <ul className="text-xs text-amber-900/80 space-y-1">
        {conflicts.map((c) => (
          <li key={c.id} className="flex justify-between gap-3">
            <span>
              <span className="font-medium">{c.name}</span> · {formatEs(c.startDate)} → {formatEs(c.endDate)}
            </span>
            <span>
              {c.willWin
                ? `gana esta temporada (prioridad ${c.priority})`
                : `pierde frente a la nueva (prioridad ${c.priority})`}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-amber-900/70">
        Cuando dos temporadas se solapan, los días en común usan la de mayor prioridad. Ajusta
        las fechas o la prioridad si quieres otro resultado.
      </p>
    </div>
  );
}

function ModeCard({
  selected,
  onSelect,
  title,
  subtitle,
  name,
  value,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  name: string;
  value: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative rounded-lg border p-4 cursor-pointer transition block",
        selected
          ? "border-ink bg-white shadow-sm"
          : "border-line bg-white/50 hover:border-ink/40",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 h-4 w-4 rounded-full border shrink-0",
            selected ? "border-ink bg-ink" : "border-ink/40 bg-white",
          )}
        >
          {selected ? (
            <span className="block h-full w-full rounded-full border-2 border-white bg-ink" />
          ) : null}
        </span>
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-xs text-ink/60 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </label>
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="tracking-label text-[11px] text-ink/70">{label}</span>
      {children}
      {error ? <span className="block text-xs text-rose-700">{error}</span> : null}
      {hint && !error ? (
        <span className="block text-[11px] text-ink/50">{hint}</span>
      ) : null}
    </label>
  );
}

function computeCents({
  mode,
  discountPct,
  nightlyDollars,
  baseNightlyCents,
}: {
  mode: Mode;
  discountPct: string;
  nightlyDollars: string;
  baseNightlyCents: number;
}): number | null {
  if (mode === "discount") {
    const pct = Number(discountPct);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100 || !baseNightlyCents) return null;
    const cents = baseNightlyCents * (1 - pct / 100);
    return Math.round(cents);
  }
  const usd = Number(nightlyDollars);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  return Math.round(usd * 100);
}
