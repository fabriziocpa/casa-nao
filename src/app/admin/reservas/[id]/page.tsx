import Link from "next/link";
import { notFound } from "next/navigation";
import { getReservation } from "@/features/reservations/queries.admin";
import {
  confirmReservation,
  rejectReservation,
  cancelConfirmedReservation,
  updateAdminNotes,
  updateRejectedReservation,
  deleteRejectedReservation,
  deleteCancelledReservation,
} from "@/features/reservations/actions";
import { RejectedActions } from "@/features/reservations/components/RejectedActions";
import { ConfirmedActions } from "@/features/reservations/components/ConfirmedActions";
import { PendingActions } from "@/features/reservations/components/PendingActions";
import { CancelledActions } from "@/features/reservations/components/CancelledActions";
import { formatUSDPrecise, formatUSD } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { whatsappLink } from "@/lib/whatsapp";
import { StatusBadge } from "@/components/layout/StatusBadge";
import type { NightlyBreakdown } from "@/types";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getReservation(id);
  if (!r) notFound();

  const breakdown: NightlyBreakdown = (() => {
    try {
      return JSON.parse(r.nightlyBreakdown);
    } catch {
      return [];
    }
  })();

  const confirm = async () => {
    "use server";
    await confirmReservation(r.id);
  };
  const reject = async () => {
    "use server";
    await rejectReservation(r.id);
  };
  const cancelConfirmed = async () => {
    "use server";
    await cancelConfirmedReservation(r.id);
  };
  const saveNotes = async (fd: FormData) => {
    "use server";
    const notes = String(fd.get("adminNotes") ?? "");
    await updateAdminNotes(r.id, notes);
  };
  const saveRejectedEdit = async (fd: FormData) => {
    "use server";
    await updateRejectedReservation(r.id, fd);
  };
  const deleteRejected = async () => {
    "use server";
    await deleteRejectedReservation(r.id);
  };
  const deleteCancelled = async () => {
    "use server";
    await deleteCancelledReservation(r.id);
  };

  const wa = whatsappLink(
    r.phone.startsWith("+") ? r.phone : `+51${r.phone}`,
    `Hola ${r.firstName}, soy CASA NAO. Sobre tu reserva del ${r.checkIn} al ${r.checkOut}:`,
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Back + badge */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/reservas"
          className="tracking-label text-[11px] text-ink/60 hover:text-ink"
        >
          ← Volver
        </Link>
        <StatusBadge status={r.status} />
      </div>

      {/* Header */}
      <header>
        <p className="tracking-label text-xs text-ink/60">Reserva</p>
        <h1 className="text-2xl md:text-3xl font-display">
          {r.firstName} {r.lastName}
        </h1>
        <p className="text-ink/70 mt-1 text-sm">
          {formatEs(r.checkIn)} → {formatEs(r.checkOut)} · {r.nights} noches · {r.guests} huéspedes
        </p>
      </header>

      {/* Primary actions — always near the top so they're reachable on mobile */}
      <section className="rounded-xl border border-line bg-white/70 p-4 space-y-4">
        {r.status === "pending" ? (
          <PendingActions confirmAction={confirm} rejectAction={reject} />
        ) : null}

        <div className="flex flex-wrap gap-2">
          {r.status === "confirmed" ? (
            <ConfirmedActions cancelAction={cancelConfirmed} />
          ) : null}
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] text-white tracking-label text-[11px] px-4 py-2"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
          <a
            href={`mailto:${r.email}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line tracking-label text-[11px] px-4 py-2"
          >
            <MailIcon />
            Correo
          </a>
        </div>

        {r.status === "rejected" ? (
          <div className="border-t border-line pt-4">
            <RejectedActions
              reservationId={r.id}
              defaults={{
                firstName: r.firstName,
                lastName: r.lastName,
                email: r.email,
                phone: r.phone,
                guests: r.guests,
                message: r.message ?? "",
              }}
              updateAction={saveRejectedEdit}
              deleteAction={deleteRejected}
            />
          </div>
        ) : null}
        {r.status === "cancelled" ? (
          <div className="border-t border-line pt-4">
            <CancelledActions deleteAction={deleteCancelled} />
          </div>
        ) : null}
      </section>

      {/* Info cards */}
      <section className="grid gap-3 sm:grid-cols-3">
        <InfoCard label="Contacto">
          <p className="truncate">{r.email}</p>
          <p>{r.phone.startsWith("+") ? r.phone : `+51 ${r.phone}`}</p>
        </InfoCard>
        <InfoCard label="Documento">
          <p>{r.docType} · {r.docNumber}</p>
        </InfoCard>
        <InfoCard label="Total">
          <p className="font-display text-2xl">{formatUSDPrecise(r.totalCents)}</p>
          <p className="text-ink/60 text-xs">{r.currency}</p>
        </InfoCard>
      </section>

      {/* Guest message */}
      {r.message ? (
        <section className="rounded-xl border border-line bg-white/70 p-4">
          <p className="tracking-label text-[11px] text-ink/60 mb-2">Mensaje del huésped</p>
          <p className="text-ink/80 whitespace-pre-line text-sm">{r.message}</p>
        </section>
      ) : null}

      {/* Nightly breakdown — collapsible on mobile */}
      <details className="group rounded-xl border border-line bg-white/70 overflow-hidden">
        <summary className="cursor-pointer flex items-center justify-between p-4 list-none">
          <p className="tracking-label text-[11px] text-ink/60">Desglose por noche</p>
          <span className="tracking-label text-[11px] text-ink/50 group-open:hidden">
            Ver {breakdown.length} noches
          </span>
          <span className="tracking-label text-[11px] text-ink/50 hidden group-open:inline">
            Ocultar
          </span>
        </summary>
        <ul className="divide-y divide-line px-4 pb-2">
          {breakdown.map((n) => (
            <li key={n.date} className="flex justify-between py-2 text-sm">
              <span className="capitalize">{formatEs(n.date, "EEE d MMM yyyy")}</span>
              <span>{formatUSD(n.cents)}</span>
            </li>
          ))}
        </ul>
      </details>

      {/* Admin notes */}
      <section className="rounded-xl border border-line bg-white/70 p-4">
        <form action={saveNotes} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="tracking-label text-[11px] text-ink/60">Notas internas</span>
            <textarea
              name="adminNotes"
              defaultValue={r.adminNotes ?? ""}
              rows={4}
              placeholder="Observaciones para el equipo, no las ve el huésped."
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-full bg-ink text-bg tracking-label text-[11px] px-5 py-2 hover:bg-deep-ocean transition">
            Guardar notas
          </button>
        </form>
      </section>
    </div>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/70 p-4">
      <p className="tracking-label text-[11px] text-ink/60 mb-1.5">{label}</p>
      <div className="text-sm space-y-0.5">{children}</div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
