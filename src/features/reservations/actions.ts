"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { reservations, blockedDates } from "@/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

  const admin = createSupabaseAdminClient();
  const nightDates = stayNightDates(fromIso(input.checkIn), fromIso(input.checkOut)).map(toIso);

  const { error: rpcError } = await admin.rpc(
    "create_reservation_with_blocks",
    {
      p_reservation: {
        check_in: input.checkIn,
        check_out: input.checkOut,
        nights: stay.nights,
        guests: input.guests,
        doc_type: input.docType,
        doc_number: input.docNumber.trim().toUpperCase(),
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        message: input.message ?? null,
        consent: input.consent,
        nightly_breakdown: JSON.stringify(stay.breakdown),
        total_cents: stay.totalCents,
        currency: "USD",
      },
      p_dates: nightDates,
    },
  );

  if (rpcError) {
    const isConflict = rpcError.message?.includes("DATES_CONFLICT");
    return {
      ok: false,
      error: isConflict
        ? "Las fechas seleccionadas ya no están disponibles."
        : "No pudimos guardar tu solicitud. Intenta nuevamente.",
    };
  }

  revalidatePath("/");
  redirect("/reserva/exito");
}

export async function confirmReservation(reservationId: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  await db
    .update(reservations)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(reservations.id, reservationId));

  revalidatePath("/");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservationId}`);
}

export async function rejectReservation(reservationId: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");

  await db
    .update(reservations)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(reservations.id, reservationId));
  await db.delete(blockedDates).where(eq(blockedDates.reservationId, reservationId));

  revalidatePath("/");
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

  revalidatePath("/admin/reservas");
  redirect("/admin/reservas");
}
