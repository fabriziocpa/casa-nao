import type { Metadata } from "next";
import { getPublicSettings } from "@/features/settings/public-settings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Políticas",
  description:
    "Políticas de la casa, privacidad y términos de reserva — CASA NAO.",
};

export default async function PoliticasPage() {
  const settings = await getPublicSettings();

  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-10">
          <p className="tracking-label text-xs text-ink/60 mb-3">Políticas</p>
          <h2 className="text-2xl font-display">Reglas</h2>
        </header>

        <section className="space-y-3">
          <ul className="divide-y divide-line">
            <li className="py-3 text-ink/80">Check-in: 2:00 pm</li>
            <li className="py-3 text-ink/80">Check-out: 11:00 am</li>
            <li className="py-3 text-ink/80">
              Prohibido fumar dentro de la casa
            </li>
            <li className="py-3 text-ink/80">
              Prohibida la música alta después de medianoche
            </li>
          </ul>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-display">Privacidad</h2>
          <p className="text-ink/80 leading-relaxed">
            Tus datos personales (incluyendo DNI / CE / pasaporte, teléfono y
            correo) se recopilan únicamente con el fin de gestionar tu reserva,
            cumpliendo con la Ley de Protección de Datos Personales N° 29733 del
            Perú. No compartimos tu información con terceros salvo por
            obligación legal.
          </p>
          <p className="text-ink/80 leading-relaxed">
            Para consultas, escríbenos a{" "}
            <a href={`mailto:${settings.contact_email}`} className="underline">
              {settings.contact_email}
            </a>{" "}
            o por WhatsApp {settings.whatsapp}.
          </p>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-display">Reserva y pago</h2>
          <p className="text-ink/80 leading-relaxed">
            Las reservas se gestionan por solicitud. Una vez confirmadas, te
            enviaremos por correo las instrucciones de pago por transferencia
            bancaria, Yape o Plin. Las fechas quedan reservadas al recibir la
            confirmación del depósito.
          </p>
        </section>
      </div>
    </div>
  );
}
