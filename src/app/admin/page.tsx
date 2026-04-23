import Link from "next/link";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { getDashboardKpis, getMonthHeatmap } from "@/features/reservations/queries.admin";
import { formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { eachDayOfInterval, parseISO } from "date-fns";

export default async function AdminHomePage() {
  const [kpis, heatmap] = await Promise.all([getDashboardKpis(), getMonthHeatmap(0)]);
  const days = eachDayOfInterval({
    start: parseISO(heatmap.start),
    end: parseISO(heatmap.end),
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="tracking-label text-xs text-ink/60">Resumen</p>
        <h1 className="text-3xl font-display">Hoy en CASA NAO</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Kpi label="Pendientes" value={String(kpis.pending)} />
        <Kpi label="Confirmadas (mes)" value={String(kpis.confirmedThisMonth)} />
        <Kpi label="Ingresos del mes" value={formatUSDPrecise(kpis.revenueCentsThisMonth)} />
        <Kpi label="Ocupación" value={`${kpis.occupancyPct}%`} />
      </section>

      <section>
        <h2 className="tracking-label text-xs text-ink/60 mb-3">Mapa de ocupación · este mes</h2>
        <div className="grid grid-cols-7 gap-1.5 rounded-xl border border-line bg-white/60 p-4">
          {days.map((d) => {
            const iso = d.toISOString().slice(0, 10);
            const reason = heatmap.map[iso];
            return (
              <div
                key={iso}
                title={`${iso}${reason ? ` — ${reason}` : " — libre"}`}
                className={
                  "aspect-square rounded-sm flex items-center justify-center text-[10px] " +
                  (reason === "reservation"
                    ? "bg-teal text-white"
                    : reason
                      ? "bg-rose/60 text-ink"
                      : "bg-sand/40 text-ink/50")
                }
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="tracking-label text-xs text-ink/60">Últimas 5 solicitudes</h2>
          <Link
            href="/admin/reservas"
            className="tracking-label text-[11px] underline underline-offset-4"
          >
            Ver todas →
          </Link>
        </div>
        <ul className="divide-y divide-line rounded-xl border border-line bg-white/60">
          {kpis.latest.length === 0 ? (
            <li className="p-4 text-ink/60 text-sm">Aún no hay reservas.</li>
          ) : (
            kpis.latest.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/reservas/${r.id}`}
                  className="flex items-center justify-between p-4 hover:bg-sand/30"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="text-xs text-ink/60">
                      {formatEs(r.checkIn)} → {formatEs(r.checkOut)} · {r.nights} noches ·{" "}
                      {r.guests} huéspedes
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{formatUSDPrecise(r.totalCents)}</span>
                    <StatusBadge status={r.status} />
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/60 p-5">
      <p className="tracking-label text-[11px] text-ink/60">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}

