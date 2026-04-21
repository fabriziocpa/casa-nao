import { addMonths, startOfMonth } from "date-fns";
import { and, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { blockedDates } from "@/db/schema";
import { toIso } from "@/lib/dates";
import { AdminCalendarClient } from "./AdminCalendarClient";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const today = startOfMonth(new Date());
  const until = addMonths(today, 18);
  const rows = await db
    .select({ date: blockedDates.date, reason: blockedDates.reason })
    .from(blockedDates)
    .where(and(gte(blockedDates.date, toIso(today)), lte(blockedDates.date, toIso(until))));

  const reasons = Object.fromEntries(rows.map((r) => [r.date, r.reason])) as Record<string, string>;

  return (
    <div className="space-y-6">
      <header>
        <p className="tracking-label text-xs text-ink/60">Calendario</p>
        <h1 className="text-3xl font-display">Disponibilidad y bloqueos manuales</h1>
        <p className="text-ink/70 mt-1 max-w-xl">
          Haz clic en un día libre para agregar un bloqueo manual (por ejemplo,
          uso propio o mantenimiento). Los bloqueos de reservas confirmadas son
          de sólo lectura.
        </p>
      </header>
      <AdminCalendarClient reasons={reasons} />
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex gap-4 text-[11px] tracking-label text-ink/60">
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-teal" /> Reserva
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-rose/60" /> Manual / mantenimiento
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-sand/50" /> Libre
      </span>
    </div>
  );
}
