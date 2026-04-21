import Link from "next/link";
import { listReservations } from "@/features/reservations/queries.admin";
import { formatUSDPrecise } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { StatusBadge } from "../page";

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
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="tracking-label text-xs text-ink/60">Reservas</p>
          <h1 className="text-3xl font-display">Solicitudes y estadías</h1>
        </div>
        <form className="flex gap-2 items-end">
          <label className="block">
            <span className="sr-only">Buscar</span>
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Nombre, correo, doc."
              className="h-9 rounded-md border border-line bg-white px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="sr-only">Estado</span>
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
          </label>
          <button className="h-9 px-4 rounded-md bg-ink text-bg tracking-label text-[11px]">
            Filtrar
          </button>
        </form>
      </header>

      <div className="overflow-x-auto rounded-xl border border-line bg-white/60">
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink/60">
                  No hay reservas con los filtros actuales.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
