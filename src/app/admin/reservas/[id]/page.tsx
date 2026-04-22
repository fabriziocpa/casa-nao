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
} from "@/features/reservations/actions";
import { RejectedActions } from "@/features/reservations/components/RejectedActions";
import { ConfirmedActions } from "@/features/reservations/components/ConfirmedActions";
import { PendingActions } from "@/features/reservations/components/PendingActions";
import { formatUSDPrecise, formatUSD } from "@/lib/money";
import { formatEs } from "@/lib/dates";
import { whatsappLink } from "@/lib/whatsapp";
import { StatusBadge } from "../../page";
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

  const wa = whatsappLink(
    r.phone.startsWith("+") ? r.phone : `+51${r.phone}`,
    `Hola ${r.firstName}, soy CASA NAO. Sobre tu reserva del ${r.checkIn} al ${r.checkOut}:`,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/reservas"
          className="tracking-label text-[11px] text-ink/60 hover:text-ink"
        >
          ← Volver
        </Link>
        <StatusBadge status={r.status} />
      </div>

      <header>
        <p className="tracking-label text-xs text-ink/60">Reserva</p>
        <h1 className="text-3xl font-display">
          {r.firstName} {r.lastName}
        </h1>
        <p className="text-ink/70 mt-1">
          {formatEs(r.checkIn)} → {formatEs(r.checkOut)} · {r.nights} noches ·{" "}
          {r.guests} huéspedes
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Info label="Contacto">
          <p>{r.email}</p>
          <p>{r.phone.startsWith("+") ? r.phone : `+51 ${r.phone}`}</p>
        </Info>
        <Info label="Documento">
          <p>
            {r.docType} · {r.docNumber}
          </p>
        </Info>
        <Info label="Total">
          <p className="font-display text-2xl">{formatUSDPrecise(r.totalCents)}</p>
          <p className="text-ink/60 text-xs">{r.currency}</p>
        </Info>
      </section>

      {r.message ? (
        <section className="rounded-xl border border-line bg-white/60 p-5">
          <p className="tracking-label text-[11px] text-ink/60 mb-2">Mensaje del huésped</p>
          <p className="text-ink/80 whitespace-pre-line">{r.message}</p>
        </section>
      ) : null}

      <section className="rounded-xl border border-line bg-white/60 p-5">
        <p className="tracking-label text-[11px] text-ink/60 mb-3">Desglose por noche</p>
        <ul className="divide-y divide-line">
          {breakdown.map((n) => (
            <li key={n.date} className="flex justify-between py-2 text-sm">
              <span className="capitalize">{formatEs(n.date, "EEE d MMM yyyy")}</span>
              <span>{formatUSD(n.cents)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-white/60 p-5 space-y-4">
        <p className="tracking-label text-[11px] text-ink/60">Acciones</p>
        {r.status === "pending" ? (
          <PendingActions confirmAction={confirm} rejectAction={reject} />
        ) : null}
        <div className="flex flex-wrap gap-3">
          {r.status === "confirmed" ? (
            <ConfirmedActions cancelAction={cancelConfirmed} />
          ) : null}
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#25D366] text-white tracking-label text-[11px] px-5 py-2"
          >
            WhatsApp al huésped
          </a>
          <a
            href={`mailto:${r.email}`}
            className="rounded-full border border-line tracking-label text-[11px] px-5 py-2"
          >
            Enviar correo
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
      </section>

      <section className="rounded-xl border border-line bg-white/60 p-5">
        <form action={saveNotes} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="tracking-label text-[11px] text-ink/60">Notas internas</span>
            <textarea
              name="adminNotes"
              defaultValue={r.adminNotes ?? ""}
              rows={5}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-md bg-ink text-bg tracking-label text-[11px] px-4 py-2">
            Guardar notas
          </button>
        </form>
      </section>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/60 p-5">
      <p className="tracking-label text-[11px] text-ink/60 mb-2">{label}</p>
      <div className="text-sm space-y-0.5">{children}</div>
    </div>
  );
}
