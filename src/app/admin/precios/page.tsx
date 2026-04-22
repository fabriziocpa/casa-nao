import { asc } from "drizzle-orm";
import { db } from "@/db";
import { pricingRules, basePricing } from "@/db/schema";
import {
  deletePricingRule,
  upsertPricingRule,
} from "@/features/pricing-rules/actions";
import { formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { RuleForm } from "./RuleForm";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
  const [rules, baseRows] = await Promise.all([
    db.select().from(pricingRules).orderBy(asc(pricingRules.startDate)),
    db.select().from(basePricing).limit(1),
  ]);
  const base = baseRows[0];
  const baseNightlyCents = base?.nightlyCents ?? 0;

  return (
    <div className="space-y-10">
      <header>
        <p className="tracking-label text-xs text-ink/60">Precios</p>
        <h1 className="text-3xl font-display">Tarifas por temporada</h1>
      </header>

      <section className="rounded-xl border border-line bg-white/60 p-5">
        <p className="tracking-label text-[11px] text-ink/60">Tarifa base</p>
        <p className="font-display text-2xl">
          {base ? formatUSDPrecise(base.nightlyCents) : "—"} / noche
        </p>
        <p className="text-xs text-ink/60">
          Mínimo {base?.minNights ?? 2} noches · capacidad máxima {base?.maxGuests ?? 15}.
        </p>
      </section>

      <section>
        <h2 className="tracking-label text-[11px] text-ink/60 mb-3">Reglas activas y programadas</h2>
        <div className="space-y-4">
          {rules.length === 0 ? (
            <p className="text-ink/60 text-sm">
              No hay reglas. Agrega una nueva abajo.
            </p>
          ) : (
            rules.map((r) => (
              <RuleCard key={r.id} rule={r} baseNightlyCents={baseNightlyCents} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="tracking-label text-[11px] text-ink/60 mb-3">Nueva regla</h2>
        <RuleForm
          action={upsertPricingRule}
          baseNightlyCents={baseNightlyCents}
          submitLabel="Crear regla"
        />
      </section>
    </div>
  );
}

function RuleCard({
  rule,
  baseNightlyCents,
}: {
  rule: typeof pricingRules.$inferSelect;
  baseNightlyCents: number;
}) {
  const del = async () => {
    "use server";
    await deletePricingRule(rule.id);
  };
  return (
    <div className="rounded-xl border border-line bg-white/60 p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl">{rule.name}</p>
          <p className="text-sm text-ink/70">
            {formatEs(rule.startDate)} → {formatEs(rule.endDate)}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>{formatUSDPrecise(rule.nightlyCents)} / noche</p>
          <p className="text-xs text-ink/60">
            Min {rule.minNights ?? "—"} · prioridad {rule.priority} ·{" "}
            {rule.active ? "activa" : "inactiva"}
          </p>
        </div>
      </div>
      <details>
        <summary className="cursor-pointer tracking-label text-[11px] text-ink/60">
          Editar
        </summary>
        <div className="pt-3">
          <RuleForm
            action={upsertPricingRule}
            rule={rule}
            baseNightlyCents={baseNightlyCents}
            submitLabel="Guardar cambios"
          />
        </div>
      </details>
      <form action={del}>
        <button className="tracking-label text-[11px] text-rose-700 underline underline-offset-4">
          Eliminar regla
        </button>
      </form>
    </div>
  );
}
