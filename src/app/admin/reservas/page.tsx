import Link from "next/link";
import { listReservations } from "@/features/reservations/queries.admin";
import { formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { StatusBadge } from "@/components/layout/StatusBadge";

type StatusFilter = "all" | "pending" | "confirmed" | "rejected" | "cancelled";

export default async function ReservationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const status = (sp.status as StatusFilter) ?? "all";
  const rows = await listReservations({
    status,
    search: sp.q,
    from: sp.from,
    to: sp.to,
    limit: 100,
  });

  const statuses: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "pending", label: "Pendientes" },
    { value: "confirmed", label: "Confirmadas" },
    { value: "rejected", label: "Rechazadas" },
    { value: "cancelled", label: "Canceladas" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="tracking-label text-xs text-ink/60">Reservas</p>
        <h1 className="text-3xl font-display">Solicitudes y estadías</h1>
      </header>

      <form className="flex flex-col sm:flex-row gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Buscar por nombre, correo o doc."
          className="h-9 flex-1 rounded-md border border-line bg-white px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-line bg-white px-2 text-sm"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button className="h-9 px-4 rounded-md bg-ink text-bg tracking-label text-[11px]">
          Filtrar
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="text-ink/60 text-sm py-8 text-center">
          No hay reservas con los filtros actuales.
        </p>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/reservas/${r.id}`}
                  className="block rounded-xl border border-line bg-white/70 p-4 active:bg-sand/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {r.firstName} {r.lastName}
                      </p>
                      <p className="text-xs text-ink/60 mt-0.5">
                        {formatEs(r.checkIn, "d MMM")} → {formatEs(r.checkOut, "d MMM yyyy")} ·{" "}
                        {r.nights} noches
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-ink/50 truncate">{r.email}</p>
                    <p className="text-sm font-display shrink-0">{formatUSDPrecise(r.totalCents)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-line bg-white/60">
            <table className="w-full text-sm">
              <thead className="bg-sand/40 text-ink/70">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Huésped</th>
                  <th className="text-left px-4 py-3 font-medium">Fechas</th>
                  <th className="text-left px-4 py-3 font-medium">Huéspedes</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {r.firstName} {r.lastName}
                      </p>
                      <p className="text-xs text-ink/60">{r.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/80">
                      {formatEs(r.checkIn, "d MMM")} → {formatEs(r.checkOut, "d MMM yyyy")}
                      <span className="text-ink/50 text-xs"> · {r.nights} noches</span>
                    </td>
                    <td className="px-4 py-3">{r.guests}</td>
                    <td className="px-4 py-3">{formatUSDPrecise(r.totalCents)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/reservas/${r.id}`}
                        className="tracking-label text-[11px] underline underline-offset-4"
                      >
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
