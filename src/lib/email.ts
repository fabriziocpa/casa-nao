import "server-only";
import { Resend } from "resend";

import { formatUSDPrecise } from "./money";

export type ReservationEmailData = {
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  docType: string;
  docNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string | null;
  totalCents: number;
  currency: string;
};

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderText(r: ReservationEmailData): string {
  const total =
    r.currency === "USD" ? formatUSDPrecise(r.totalCents) : `${r.totalCents / 100} ${r.currency}`;
  const lines = [
    "Nueva solicitud de reserva",
    "",
    `Nombre:     ${r.firstName} ${r.lastName}`,
    `Documento:  ${r.docType} ${r.docNumber}`,
    `Email:      ${r.email}`,
    `Teléfono:   ${r.phone}`,
    "",
    `Check-in:   ${r.checkIn}`,
    `Check-out:  ${r.checkOut}`,
    `Noches:     ${r.nights}`,
    `Huéspedes:  ${r.guests}`,
    `Total:      ${total}`,
  ];
  if (r.message) {
    lines.push("", "Mensaje:", r.message);
  }
  return lines.join("\n");
}

function renderHtml(r: ReservationEmailData): string {
  const total =
    r.currency === "USD" ? formatUSDPrecise(r.totalCents) : `${r.totalCents / 100} ${r.currency}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#555;">${escapeHtml(label)}</td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`;
  const messageBlock = r.message
    ? `<p style="margin:16px 0 4px;color:#555;">Mensaje:</p><p style="margin:0;white-space:pre-wrap;">${escapeHtml(r.message)}</p>`
    : "";
  return `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;">
  <h2 style="margin:0 0 12px;">Nueva solicitud de reserva</h2>
  <table style="border-collapse:collapse;font-size:14px;">
    ${row("Nombre", `${r.firstName} ${r.lastName}`)}
    ${row("Documento", `${r.docType} ${r.docNumber}`)}
    ${row("Email", r.email)}
    ${row("Teléfono", r.phone)}
    ${row("Check-in", r.checkIn)}
    ${row("Check-out", r.checkOut)}
    ${row("Noches", String(r.nights))}
    ${row("Huéspedes", String(r.guests))}
    ${row("Total", total)}
  </table>
  ${messageBlock}
</body></html>`;
}

export async function sendReservationNotification(
  reservation: ReservationEmailData,
): Promise<void> {
  const client = getClient();
  const to = process.env.RESERVATION_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM;

  if (!client || !to || !from) {
    console.warn(
      "[email] Skipping reservation notification — missing RESEND_API_KEY, RESEND_FROM, or RESERVATION_NOTIFICATION_EMAIL.",
    );
    return;
  }

  const subject = `Nueva reserva: ${reservation.firstName} ${reservation.lastName} (${reservation.checkIn} → ${reservation.checkOut})`;

  const result = await client.emails.send({
    from,
    to,
    replyTo: reservation.email,
    subject,
    text: renderText(reservation),
    html: renderHtml(reservation),
  });

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }
}
