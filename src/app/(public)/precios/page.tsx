import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Tarifa estándar por noche en CASA NAO y promociones para grupos pequeños.",
};

export default function PreciosPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-10">
          <p className="tracking-label text-xs text-ink/60 mb-3">Precios</p>
          <h2 className="text-2xl font-display">Tarifa por noche</h2>
        </header>

        <section className="space-y-6">
          <p className="text-ink/80 leading-relaxed">
            CASA NAO es una residencia frente al mar pensada para recibir hasta
            quince huéspedes. Nuestra tarifa estándar incluye toda la casa con
            sus cinco habitaciones, áreas comunes, piscina de borde infinito y
            limpieza diaria de 8am a 4pm.
          </p>

          <div className="rounded-2xl border border-line bg-sand/40 p-8 md:p-10">
            <p className="tracking-label text-xs text-ink/60 mb-3">
              Tarifa estándar
            </p>
            <p className="text-4xl md:text-5xl font-display leading-none">
              $700{" "}
              <span className="text-lg md:text-xl text-ink/60 align-baseline">
                / noche
              </span>
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Casa completa · hasta 15 huéspedes · check-in 2:00 pm ·
              check-out 11:00 am.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-sand/40 p-8 md:p-10">
            <p className="tracking-label text-xs text-ink/60 mb-3">
              Temporada alta y festividades
            </p>
            <p className="text-4xl md:text-5xl font-display leading-none">
              $900{" "}
              <span className="text-lg md:text-xl text-ink/60 align-baseline">
                / noche
              </span>
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Aplicable en temporadas altas, feriados largos y festividades.
            </p>
          </div>

          <p className="text-ink/80 leading-relaxed">
            Reservar CASA NAO significa tener la propiedad entera para tu grupo:
            sin compartir espacios y con la libertad de disfrutar la playa, la
            piscina y el balcón a tu ritmo.
          </p>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-display">Promoción para grupos pequeños</h2>
          <div className="rounded-2xl border border-line p-6 md:p-8">
            <p className="tracking-label text-xs text-ink/60 mb-3">
              Aviso importante
            </p>
            <p className="text-ink/80 leading-relaxed">
              Para grupos de menos de 5 personas contamos con una promoción
              diferente a la tarifa estándar. Escríbenos para coordinar fechas
              y enviarte una cotización personalizada según tu grupo.
            </p>
          </div>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-display">¿Listo para reservar?</h2>
          <p className="text-ink/80 leading-relaxed">
            Revisa la disponibilidad y solicita tus fechas. Te responderemos en
            menos de 12 horas con la confirmación e instrucciones de pago.
          </p>
          <div className="pt-2">
            <Link
              href="/#reserva"
              className="inline-block tracking-label text-xs border border-ink/20 rounded-full px-6 py-3 hover:bg-ink hover:text-bg transition"
            >
              Reservar
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
