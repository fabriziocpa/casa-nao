import "server-only";

import { and, desc, eq, gte, ilike, ne, or, sql } from "drizzle-orm";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { db } from "@/db";
import { reservations, blockedDates } from "@/db/schema";
import { toIso } from "@/lib/dates";

export type AdminReservationFilters = {
  status?: "pending" | "confirmed" | "rejected" | "cancelled" | "all";
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export async function listReservations(f: AdminReservationFilters = {}) {
  const where = [] as ReturnType<typeof eq>[];
  if (f.status && f.status !== "all") where.push(eq(reservations.status, f.status));
  if (f.from) where.push(gte(reservations.checkIn, f.from));
  if (f.to) where.push(gte(reservations.checkOut, f.to));
  if (f.search) {
    const q = `%${f.search.trim()}%`;
    where.push(
      or(
        ilike(reservations.email, q),
        ilike(reservations.firstName, q),
        ilike(reservations.lastName, q),
        ilike(reservations.docNumber, q),
      )!,
    );
  }
  const whereExpr = where.length ? and(...where) : undefined;
  const rows = await db
    .select()
    .from(reservations)
    .where(whereExpr)
    .orderBy(desc(reservations.createdAt))
    .limit(f.limit ?? 50)
    .offset(f.offset ?? 0);
  return rows;
}

export async function getReservation(id: string) {
  const rows = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getDashboardKpis() {
  const now = new Date();
  const monthStart = toIso(startOfMonth(now));
  const monthEnd = toIso(endOfMonth(now));
  const daysInMonth = endOfMonth(now).getDate();

  const statsPromise = db
    .select({
      pending: sql<number>`count(*) filter (where ${reservations.status} = 'pending')::int`,
      confirmedThisMonth: sql<number>`count(*) filter (where ${reservations.status} = 'confirmed' and ${reservations.checkIn} >= ${monthStart})::int`,
      revenue: sql<number>`coalesce(sum(${reservations.totalCents}) filter (where ${reservations.status} = 'confirmed' and ${reservations.checkIn} >= ${monthStart}), 0)::int`,
      occupancy: sql<number>`(
        select count(*)::int
        from ${blockedDates} bd
        left join ${reservations} r on bd.reservation_id = r.id
        where bd.date >= ${monthStart}
          and bd.date <= ${monthEnd}
          and (bd.reason <> 'reservation' or r.status = 'confirmed')
      )`,
    })
    .from(reservations);

  const latestPromise = db
    .select()
    .from(reservations)
    .orderBy(desc(reservations.createdAt))
    .limit(5);

  const [[stats], latest] = await Promise.all([statsPromise, latestPromise]);

  return {
    pending: stats?.pending ?? 0,
    confirmedThisMonth: stats?.confirmedThisMonth ?? 0,
    revenueCentsThisMonth: stats?.revenue ?? 0,
    occupancyPct: Math.round(((stats?.occupancy ?? 0) / daysInMonth) * 100),
    latest,
  };
}

export async function getMonthHeatmap(monthOffset = 0) {
  const target = addMonths(new Date(), monthOffset);
  const start = toIso(startOfMonth(target));
  const end = toIso(endOfMonth(target));
  const rows = await db
    .select({ date: blockedDates.date, reason: blockedDates.reason })
    .from(blockedDates)
    .leftJoin(reservations, eq(blockedDates.reservationId, reservations.id))
    .where(
      and(
        gte(blockedDates.date, start),
        sql`${blockedDates.date} <= ${end}`,
        or(
          ne(blockedDates.reason, "reservation"),
          eq(reservations.status, "confirmed"),
        ),
      ),
    );
  const map: Record<string, string> = {};
  for (const r of rows) map[r.date] = r.reason;
  return { start, end, map };
}
