import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HeroVideo } from "@/components/media/HeroVideo";
import { NightCarousel } from "@/components/media/NightCarousel";
import { RoomCard } from "@/components/layout/RoomCard";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/StaggerChildren";
import { getPublicSettings } from "@/features/settings/public-settings";
import { ReservationSection } from "@/features/reservations/components/ReservationSection";

export const revalidate = 120;

export const metadata: Metadata = {
  description:
    "Casa de lujo frente al mar en El Ñuro, Piura. Piscina, vista al mar y acceso directo a la playa.",
};

const HERO_VIDEO = "/videos/OCEAN_ZOOM_IN.webm";

const ROOMS = [
  {
    name: "Habitación 1",
    detail: "Familiar: 1 cama king + 1 cama de plaza y media",
    view: "Vista al mar",
    videoSrc: "/videos/MAIN_ROOM_1_VIEW.webm",
    poster: "/images/MAIN_ROOM_1.avif",
  },
  {
    name: "Habitación 2",
    detail: "Familiar: 1 cama king + 1 cama de plaza y media",
    view: "Vista al mar",
    videoSrc: "/videos/SLIDING_COURTAINS.webm",
    poster: "/images/MAIN_ROOM_2.avif",
  },
  {
    name: "Habitación 3",
    detail: "Compartida: 2 camas de 2 plazas",
    view: "Habitación compartida",
    videoSrc: "/videos/ROOM_3_VIEW.webm",
    poster: "/images/ROOM_3.avif",
  },
  {
    name: "Habitación 4",
    detail: "Compartida: 2 camas de 2 plazas",
    view: "Habitación compartida",
    videoSrc: "/videos/ROOM_4_VIEW.webm",
    poster: "/images/ROOM_4.avif",
  },
  {
    name: "Habitación 5",
    detail: "Compartida: 2 camas de 2 plazas",
    view: "Habitación compartida",
    videoSrc: "/videos/ROOM_4_VIEW.webm",
    poster: "/images/ROOM_5_3.avif",
  },
];

const COMMON_SPACES = [
  {
    label: "Sala",
    title: "La sala familiar",
    copy: 'TV 86", sofás en L y luz natural durante todo el día.',
    videoSrc: "/videos/TOUR_LIVING.webm",
    poster: "/images/LIVING.avif",
  },
  {
    label: "Cocina",
    title: "Cocina abierta",
    copy: "Equipada para cocinar en grupo, con ósmosis inversa y barra comedor.",
    videoSrc: "/videos/KITCHEN_VIEW.webm",
    poster: "/images/INSIDE_NIGHT_3.avif",
  },
  {
    label: "Terraza",
    title: "Terraza sobre el mar",
    copy: "Parrilla, caja china y kamado frente a la piscina de borde infinito.",
    videoSrc: "/videos/TOUR_TERRACE_360.webm",
    poster: "/images/TERRACE.avif",
  },
];

const NIGHT_SLIDES = [
  { src: "/images/POOL_NIGHT.avif", alt: "Piscina de noche" },
  { src: "/images/OUTSIDE_NIGHT.avif", alt: "Exterior de noche" },
  { src: "/images/INSIDE_NIGHT.avif", alt: "Interior de noche" },
  {
    src: "/images/INSIDE_NIGHT_2.avif",
    alt: "Interior de noche con luces cálidas",
  },
  { src: "/images/INSIDE_NIGHT_3.avif", alt: "Espacios interiores de noche" },
];

export default async function LandingPage() {
  const settings = await getPublicSettings();

  return (
    <>
      {/* HERO */}
      <section
        data-header-tone="dark"
        className="relative h-[100svh] w-full overflow-hidden bg-ink"
      >
        <HeroVideo
          src={HERO_VIDEO}
          className="absolute inset-0 h-full w-full object-cover object-[center_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-bg">
          <Image
            src="/logos/logo-white.svg"
            alt="Logo CASA NAO"
            width={112}
            height={112}
            priority
          />
          <p className="mt-8 tracking-label text-xs md:text-sm text-bg/90">
            DONDE EL LUJO SE ENCUENTRA CON LA CALMA
          </p>
          <Link
            href="#reserva"
            className="mt-12 tracking-label text-xs border border-bg/50 rounded-full px-6 py-3 hover:bg-bg hover:text-ink transition"
          >
            Reservar
          </Link>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-bg/80 tracking-label text-[10px]">
          ↓ Desliza para explorar
        </div>
      </section>
      <div id="hero-end-sentinel" aria-hidden className="h-px" />

      {/* INTRO COPY */}
      <section className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <FadeIn className="space-y-6">
          <h2 className="text-3xl md:text-5xl font-display leading-[1.1]">
            Bienvenido a CASA NAO
          </h2>
          <p className="text-ink/75 text-lg leading-relaxed">
            Aquí, los días comienzan con el sonido de las olas, y terminan con
            atardeceres que parecen hechos a medida. Piscina, servicio
            personalizado y un entorno natural privilegiado se combinan mucho
            más que una estadía: una experiencia. No solo un destino, sino una
            forma de vivir en el mar.
          </p>
        </FadeIn>
      </section>

      {/* FACHADA — entrance + side view */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
        <FadeIn className="grid md:grid-cols-2 gap-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/images/ENTRANCE.avif"
              alt="Entrada a CASA NAO"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/images/SIDE_VIEW.avif"
              alt="Vista lateral de CASA NAO"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </FadeIn>
      </section>

      {/* LA CASA — rooms */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <FadeIn className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="tracking-label text-xs text-ink/60 mb-3">La casa</p>
            <h2 className="text-3xl md:text-5xl font-display">
              Cinco habitaciones, quince huéspedes.
            </h2>
          </div>
          <p className="hidden md:block text-sm text-ink/70 max-w-sm">
            Habitaciones 1 y 2 familiares con cama king y cama de plaza y media.
            Habitaciones 3, 4 y 5 compartidas, cada una con dos camas de 2
            plazas.
          </p>
        </FadeIn>
        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROOMS.map((room) => (
            <StaggerItem key={room.name}>
              <RoomCard
                videoSrc={room.videoSrc}
                poster={room.poster}
                view={room.view}
                name={room.name}
                detail={room.detail}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ESPACIOS COMUNES — living, kitchen, terrace */}
      <section className="bg-sand/40">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <FadeIn className="mb-10">
            <p className="tracking-label text-xs text-ink/60 mb-3">
              Espacios comunes
            </p>
            <h2 className="text-3xl md:text-5xl font-display">
              Vida adentro, vida afuera.
            </h2>
          </FadeIn>
          <StaggerChildren className="grid md:grid-cols-3 gap-4">
            {COMMON_SPACES.map((space) => (
              <StaggerItem key={space.title}>
                <div className="space-y-4">
                  <RoomCard
                    videoSrc={space.videoSrc}
                    poster={space.poster}
                    view={space.label}
                    name={space.title}
                    detail={space.copy}
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* AL CAER LA NOCHE — pool + night imagery */}
      <section data-header-tone="dark" className="bg-ink text-bg">
        <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-32">
          <FadeIn className="mb-10 max-w-2xl">
            <p className="tracking-label text-xs text-bg/60 mb-3">
              Al caer la noche
            </p>
            <h2 className="text-3xl md:text-5xl font-display">
              La casa cambia con el sol.
            </h2>
            <p className="mt-4 text-bg/70 max-w-prose">
              Luces cálidas, piscina iluminada y el sonido del mar de fondo. El
              plan perfecto después de un día de playa.
            </p>
          </FadeIn>
        </div>
        <div className="mt-8 md:mt-10">
          <NightCarousel slides={NIGHT_SLIDES} />
        </div>
      </section>

      {/* AMENITIES */}
      <section className="bg-sand/50">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <FadeIn className="mb-10">
            <p className="tracking-label text-xs text-ink/60 mb-3">
              Amenidades
            </p>
            <h2 className="text-3xl md:text-5xl font-display">
              Todo lo esencial, y más.
            </h2>
          </FadeIn>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Piscina con borde infinito
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Balcón con vista al susent y al mar
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Parrilla con caja china
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Kamado
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Internet satelital
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Aire acondicionado en todos los cuartos
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              TVs 65&quot; y 70&quot; en habitaciones
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              TV 86&quot; en sala familiar
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Netflix y YouTube Premium
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Lavadora
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Estacionamiento
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Vista al mar
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Balcón con vista al susent y al mar
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Acceso directo a playa
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Grupo electrógeno de respaldo
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Agua tratada en toda la casa
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Ósmosis inversa en cocina
            </li>
            <li className="py-3 border-t border-line text-sm text-ink/80">
              Limpieza diaria 8am-4pm
            </li>
          </ul>
        </div>
      </section>

      {/* EXTRAS
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <FadeIn className="grid md:grid-cols-12 gap-10 items-start">
          <p className="md:col-span-4 tracking-label text-xs text-ink/60">
            Servicios extras
          </p>
          <div className="md:col-span-8 space-y-3">
            <p className="text-xl md:text-2xl font-display leading-snug">
              Chef (con costo)
            </p>
            <p className="text-xl md:text-2xl font-display leading-snug">
              Transporte desde Órganos o Talara (con costo)
            </p>
            <p className="text-sm text-ink/60 pt-4">
              Consúltanos para cotizar estos servicios al momento de confirmar
              tu reserva.
            </p>
          </div>
        </FadeIn>
      </section>*/}

      {/* DISPONIBILIDAD — reservation */}
      <section id="reserva" className="bg-bg border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <FadeIn className="mb-10">
            <p className="tracking-label text-xs text-ink/60 mb-3">
              Disponibilidad
            </p>
            <h2 className="text-3xl md:text-5xl font-display">
              Solicita tu reserva.
            </h2>
            <p className="mt-3 text-ink/70 max-w-xl">
              Revisaremos las fechas y te responderemos en menos de 12 horas
              (horario de atención {settings.attention_hours}).
            </p>
          </FadeIn>
          <ReservationSection />
        </div>
      </section>

      {/* UBICACIÓN */}
      <section data-header-tone="dark" className="bg-deep-ocean text-bg">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <FadeIn className="space-y-6">
            <p className="tracking-label text-xs text-bg/70">Ubicación</p>
            <h2 className="text-3xl md:text-4xl font-display">
              El Ñuro, Piura.
            </h2>
            <p className="text-bg/80 max-w-prose">
              {settings.address_line}. A 1h desde el aeropuerto de Talara; 1,145
              km al norte de Lima por la Panamericana.
            </p>
            <p className="text-bg/60 text-sm">
              Check-in {settings.checkin_time} · Check-out{" "}
              {settings.checkout_time}
            </p>
            <a
              href="https://www.google.com/maps/place/NORD+CONDOMINIO/@-4.199064,-81.1596561,16z"
              target="_blank"
              rel="noreferrer"
              className="inline-block tracking-label text-xs underline underline-offset-4 text-bg/80 hover:text-bg"
            >
              Abrir en Google Maps
            </a>
          </FadeIn>
          <FadeIn
            delay={0.1}
            className="aspect-video rounded-2xl overflow-hidden bg-ink"
          >
            <iframe
              title="CASA NAO — Ubicación"
              src="https://www.google.com/maps?q=Condominio+NORD,+El+%C3%91uro,+Per%C3%BA&z=16&output=embed"
              loading="lazy"
              className="w-full h-full border-0"
            />
          </FadeIn>
        </div>
      </section>

      {/* CONTACTO
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-28 text-center">
        <FadeIn className="space-y-6">
          <p className="tracking-label text-xs text-ink/60">Contacto</p>
          <h2 className="text-3xl md:text-5xl font-display">
            ¿Preguntas? Escríbenos.
          </h2>
          <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm">
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="tracking-label text-xs border border-ink/20 rounded-full px-5 py-2 hover:bg-ink hover:text-bg transition"
            >
              WhatsApp {settings.whatsapp}
            </a>
            <a
              href={`mailto:${settings.contact_email}`}
              className="tracking-label text-xs border border-ink/20 rounded-full px-5 py-2 hover:bg-ink hover:text-bg transition"
            >
              {settings.contact_email}
            </a>
          </div>
          <p className="text-ink/60 text-xs pt-2">
            Atención {settings.attention_hours}
          </p>
        </FadeIn>
      </section>*/}
    </>
  );
}
