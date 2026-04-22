"use server";

import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { reservations, blockedDates } from "@/db/schema";
import { checkReservationRateLimit } from "@/lib/rate-limit";
import { stayNightDates, toIso, fromIso } from "@/lib/dates";
import { reservationInputSchema } from "./schemas";
import { calculateStay } from "./pricing";
import { getActivePricingRules, getBasePricing } from "./queries";
import { requireAdmin } from "@/lib/supabase/server";

export type ReservationFormState =
  | { ok: true; reservationId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | null;

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function submitReservation(
  _prev: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const ip = await getClientIp();
  const rate = await checkReservationRateLimit(`ip:${ip}`);
  if (!rate.success) {
    return { ok: false, error: "Demasiados intentos. Intenta nuevamente en una hora." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = reservationInputSchema.safeParse({
    ...raw,
    consent: raw.consent,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisa los campos del formulario.", fieldErrors };
  }
  const input = parsed.data;

  const [rules, base] = await Promise.all([
    getActivePricingRules(),
    getBasePricing(),
  ]);

  if (input.guests > base.maxGuests) {
    return { ok: false, error: `Capacidad máxima: ${base.maxGuests} huéspedes.` };
  }

  const stay = calculateStay(input.checkIn, input.checkOut, rules, base);
  if (stay.nights < stay.minNightsRequired) {
    return {
      ok: false,
      error: `La temporada seleccionada requiere mínimo ${stay.minNightsRequired} noches.`,
    };
  }

  const nightDates = stayNightDates(fromIso(input.checkIn), fromIso(input.checkOut)).map(toIso);
  const conflicts = await db
    .select({ date: blockedDates.date })
    .from(blockedDates)
    .leftJoin(reservations, eq(blockedDates.reservationId, reservations.id))
    .where(
      and(
        inArray(blockedDates.date, nightDates),
        or(
          ne(blockedDates.reason, "reservation"),
          eq(reservations.status, "confirmed"),
        ),
      ),
    )
    .limit(1);
  if (conflicts[0]) {
    return {
      ok: false,
      error: "Las fechas seleccionadas ya no están disponibles.",
    };
  }

  await db.insert(reservations).values({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: stay.nights,
    guests: input.guests,
    docType: input.docType,
    docNumber: input.docNumber.trim().toUpperCase(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    message: input.message ?? null,
    consent: input.consent,
    nightlyBreakdown: JSON.stringify(stay.breakdown),
    totalCents: stay.totalCents,
    currency: "USD",
    status: "pending",
  });

  revalidatePath("/");
  redirect("/reserva/exito");
}

export async function confirmReservation(reservationId: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  const rows = await db
    .select({
      id: reservations.id,
      status: reservations.status,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
    })
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);
  const reservation = rows[0];
  if (!reservation) throw new Error("Reservation not found");
  if (reservation.status !== "pending") {
    throw new Error("Solo se pueden confirmar solicitudes pendientes.");
  }

  const nightDates = stayNightDates(
    fromIso(reservation.checkIn),
    fromIso(reservation.checkOut),
  ).map(toIso);

  await db.transaction(async (tx) => {
    const staleReservationIds = tx
      .select({ id: reservations.id })
      .from(reservations)
      .where(ne(reservations.status, "confirmed"));
    await tx
      .delete(blockedDates)
      .where(
        and(
          eq(blockedDates.reason, "reservation"),
          inArray(blockedDates.date, nightDates),
          inArray(blockedDates.reservationId, staleReservationIds),
        ),
      );

    const updated = await tx
      .update(reservations)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, "pending"),
        ),
      )
      .returning({ id: reservations.id });
    if (!updated[0]) {
      throw new Error("La solicitud ya no está pendiente.");
    }

    const inserted = await tx
      .insert(blockedDates)
      .values(
        nightDates.map((date) => ({
          date,
          reason: "reservation",
          reservationId,
        })),
      )
      .onConflictDoNothing()
      .returning({ date: blockedDates.date });

    if (inserted.length !== nightDates.length) {
      throw new Error(
        "No se pudo confirmar: las fechas ya están ocupadas o bloqueadas.",
      );
    }
  });

  revalidateTag("blocked_dates");
  revalidatePath("/");
  revalidatePath("/admin/calendario");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservationId}`);
}

export async function rejectReservation(reservationId: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(reservations)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, "pending"),
        ),
      )
      .returning({ id: reservations.id });
    if (!updated[0]) {
      throw new Error("Solo se pueden rechazar solicitudes pendientes.");
    }
    await tx.delete(blockedDates).where(eq(blockedDates.reservationId, reservationId));
  });

  revalidateTag("blocked_dates");
  revalidatePath("/");
  revalidatePath("/admin/calendario");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservationId}`);
}

export async function cancelConfirmedReservation(reservationId: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(reservations)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, "confirmed"),
        ),
      )
      .returning({ id: reservations.id });
    if (!updated[0]) {
      throw new Error("Solo se pueden cancelar reservas confirmadas.");
    }
    await tx.delete(blockedDates).where(eq(blockedDates.reservationId, reservationId));
  });

  revalidateTag("blocked_dates");
  revalidatePath("/");
  revalidatePath("/admin/calendario");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservationId}`);
}

export async function updateAdminNotes(reservationId: string, notes: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");
  await db
    .update(reservations)
    .set({ adminNotes: notes, updatedAt: new Date() })
    .where(eq(reservations.id, reservationId));
  revalidatePath(`/admin/reservas/${reservationId}`);
}

export async function updateRejectedReservation(
  reservationId: string,
  formData: FormData,
) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);
  const r = rows[0];
  if (!r) throw new Error("Reservation not found");
  if (r.status !== "rejected") {
    throw new Error("Solo se pueden editar solicitudes rechazadas.");
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const guests = Number(formData.get("guests") ?? r.guests);
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!firstName || !lastName || !email || !phone) {
    throw new Error("Todos los campos de contacto son obligatorios.");
  }

  await db
    .update(reservations)
    .set({
      firstName,
      lastName,
      email,
      phone,
      guests,
      message,
      updatedAt: new Date(),
    })
    .where(eq(reservations.id, reservationId));

  revalidatePath(`/admin/reservas/${reservationId}`);
  revalidatePath("/admin/reservas");
}

export async function deleteRejectedReservation(reservationId: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  const rows = await db
    .select({ status: reservations.status })
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);
  const r = rows[0];
  if (!r) throw new Error("Reservation not found");
  if (r.status !== "rejected") {
    throw new Error("Solo se pueden borrar solicitudes rechazadas.");
  }

  await db.delete(blockedDates).where(eq(blockedDates.reservationId, reservationId));
  await db.delete(reservations).where(eq(reservations.id, reservationId));

  revalidateTag("blocked_dates");
  revalidatePath("/");
  revalidatePath("/admin/calendario");
  revalidatePath("/admin/reservas");
}

export async function deleteCancelledReservation(reservationId: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  const rows = await db
    .select({ status: reservations.status })
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);
  const r = rows[0];
  if (!r) throw new Error("Reservation not found");
  if (r.status !== "cancelled") {
    throw new Error("Solo se pueden borrar reservas canceladas.");
  }

  await db.delete(blockedDates).where(eq(blockedDates.reservationId, reservationId));
  await db.delete(reservations).where(eq(reservations.id, reservationId));

  revalidateTag("blocked_dates");
  revalidatePath("/");
  revalidatePath("/admin/calendario");
  revalidatePath("/admin/reservas");
}
