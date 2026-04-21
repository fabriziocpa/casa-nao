import Link from "next/link";
import type { Metadata } from "next";
import { getPublicSettings } from "@/features/settings/public-settings";

export const metadata: Metadata = {
  title: "Solicitud recibida",
  description: "Hemos recibido tu solicitud de reserva.",
};

export default async function ReservaExitoPage() {
  const s = await getPublicSettings();
  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
        <p className="tracking-label text-xs text-ink/60">Solicitud recibida</p>
        <h1 className="text-4xl md:text-5xl font-display">
          Gracias por elegir CASA NAO
        </h1>
        <p className="text-ink/75 text-lg">
          Revisaremos las fechas solicitadas y te contactaremos durante nuestro
          horario de atención ({s.attention_hours}).
        </p>
        <p className="text-ink/70">
          Mientras tanto, puedes escribirnos por WhatsApp{" "}
          <a
            href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {s.whatsapp}
          </a>{" "}
          si tienes alguna pregunta.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 tracking-label text-xs underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
