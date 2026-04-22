import { asc } from "drizzle-orm";
import { db } from "@/db";
import { pricingRules } from "@/db/schema";
import {
  deletePricingRule,
  upsertPricingRule,
} from "@/features/pricing-rules/actions";
import { getBasePricing } from "@/features/reservations/queries";
import { formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { RuleForm } from "./RuleForm";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
  const [rules, base] = await Promise.all([
    db.select().from(pricingRules).orderBy(asc(pricingRules.startDate)),
    getBasePricing(),
  ]);
  const baseNightlyCents = base.nightlyCents;

  return (
    <div className="space-y-10">
      <header>
        <p className="tracking-label text-xs text-ink/60">Precios</p>
        <h1 className="text-3xl font-display">Tarifas por temporada</h1>
        <p className="text-ink/70 mt-1 max-w-xl">
          Define temporadas con precios distintos a tu tarifa base. Se aplican automáticamente
          al calendario de reservas.
        </p>
      </header>

      <section className="rounded-xl border border-line bg-white/60 p-5">
        <p className="tracking-label text-[11px] text-ink/60">Tarifa base</p>
        <p className="font-display text-2xl">
          {formatUSDPrecise(base.nightlyCents)}{" "}
          <span className="text-sm text-ink/60 font-sans">por noche</span>
        </p>
        <p className="text-xs text-ink/60">
          Mínimo {base.minNights} noches · capacidad máxima {base.maxGuests} huéspedes.
        </p>
      </section>

      <section>
        <h2 className="tracking-label text-[11px] text-ink/60 mb-3">Temporadas configuradas</h2>
        <div className="space-y-4">
          {rules.length === 0 ? (
            <p className="text-ink/60 text-sm">
              Aún no has creado temporadas. Crea la primera abajo.
            </p>
          ) : (
            rules.map((r) => (
              <RuleCard key={r.id} rule={r} baseNightlyCents={baseNightlyCents} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="tracking-label text-[11px] text-ink/60 mb-3">Nueva temporada</h2>
        <RuleForm
          action={upsertPricingRule}
          baseNightlyCents={baseNightlyCents}
          submitLabel="Crear temporada"
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display text-xl">{rule.name}</p>
          <p className="text-sm text-ink/70">
            {formatEs(rule.startDate)} → {formatEs(rule.endDate)}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-display text-lg">{formatUSDPrecise(rule.nightlyCents)}</p>
          <p className="text-xs text-ink/60">
            {rule.minNights ? `Mínimo ${rule.minNights} noches · ` : ""}
            {rule.active ? "Activa" : "Pausada"}
          </p>
        </div>
      </div>
      <details>
        <summary className="cursor-pointer tracking-label text-[11px] text-ink/60 hover:text-ink">
          Editar temporada
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
          Eliminar temporada
        </button>
      </form>
    </div>
  );
}
