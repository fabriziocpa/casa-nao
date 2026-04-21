import { asc } from "drizzle-orm";
import { db } from "@/db";
import { pricingRules, basePricing } from "@/db/schema";
import {
  deletePricingRule,
  upsertPricingRule,
} from "@/features/pricing-rules/actions";
import { formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
  const [rules, baseRows] = await Promise.all([
    db.select().from(pricingRules).orderBy(asc(pricingRules.startDate)),
    db.select().from(basePricing).limit(1),
  ]);
  const base = baseRows[0];

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
              <RuleCard key={r.id} rule={r} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="tracking-label text-[11px] text-ink/60 mb-3">Nueva regla</h2>
        <RuleForm action={upsertPricingRule} />
      </section>
    </div>
  );
}

function RuleCard({ rule }: { rule: typeof pricingRules.$inferSelect }) {
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
          <RuleForm action={upsertPricingRule} rule={rule} />
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

function RuleForm({
  action,
  rule,
}: {
  action: (fd: FormData) => Promise<void> | void;
  rule?: typeof pricingRules.$inferSelect;
}) {
  return (
    <form action={action} className="grid gap-3 md:grid-cols-6 rounded-xl border border-line bg-white/60 p-4">
      {rule?.id ? <input type="hidden" name="id" value={rule.id} /> : null}
      <label className="md:col-span-2 block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Nombre</span>
        <input
          name="name"
          defaultValue={rule?.name ?? ""}
          required
          className="w-full h-9 rounded-md border border-line px-3 text-sm bg-white"
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Inicio</span>
        <input
          name="startDate"
          type="date"
          defaultValue={rule?.startDate ?? ""}
          required
          className="w-full h-9 rounded-md border border-line px-3 text-sm bg-white"
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Fin</span>
        <input
          name="endDate"
          type="date"
          defaultValue={rule?.endDate ?? ""}
          required
          className="w-full h-9 rounded-md border border-line px-3 text-sm bg-white"
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">USD / noche</span>
        <input
          name="nightlyDollars"
          type="number"
          step="1"
          defaultValue={rule ? rule.nightlyCents / 100 : ""}
          required
          className="w-full h-9 rounded-md border border-line px-3 text-sm bg-white"
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Min noches</span>
        <input
          name="minNights"
          type="number"
          defaultValue={rule?.minNights ?? ""}
          className="w-full h-9 rounded-md border border-line px-3 text-sm bg-white"
        />
      </label>
      <label className="block space-y-1">
        <span className="tracking-label text-[11px] text-ink/60">Prioridad</span>
        <input
          name="priority"
          type="number"
          defaultValue={rule?.priority ?? 100}
          className="w-full h-9 rounded-md border border-line px-3 text-sm bg-white"
        />
      </label>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={rule?.active ?? true} />
        Activa
      </label>
      <div className="md:col-span-6">
        <button className="rounded-md bg-ink text-bg tracking-label text-[11px] px-4 py-2">
          {rule ? "Guardar cambios" : "Crear regla"}
        </button>
      </div>
    </form>
  );
}
