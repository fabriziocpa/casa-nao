import type { Metadata } from "next";
import { Lightbox } from "@/components/media/Lightbox";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galería",
  description: "Fotografías de CASA NAO — El Ñuro, Piura.",
};

const PHOTOS = [
  { src: "/images/FRONT.avif", alt: "Fachada frontal de CASA NAO" },
  { src: "/images/ENTRANCE.avif", alt: "Entrada principal" },
  { src: "/images/SIDE_VIEW.avif", alt: "Vista lateral" },
  { src: "/images/OUTSIDE_DAY.avif", alt: "Exterior de día" },
  { src: "/images/OUTSIDE_TABLE.avif", alt: "Mesa exterior" },
  { src: "/images/MAIN_ROOM_1.avif", alt: "Cuarto principal 1" },
  { src: "/images/MAIN_ROOM_2.avif", alt: "Cuarto principal 2" },
  { src: "/images/MAIN_ROOM_2_2.avif", alt: "Cuarto principal 2" },
  { src: "/images/ROOM_5_2.avif", alt: "Room 5" },
  { src: "/images/ROOM_5_3.avif", alt: "Room 5" },
  { src: "/images/ROOM_5_4.avif", alt: "Room 5" },
  { src: "/images/BATHROOM.avif", alt: "Baño" },
  { src: "/images/BATHROOM_2.avif", alt: "Baño" },
  { src: "/images/BATHROOM_3.avif", alt: "Baño" },
  { src: "/images/POOL_NIGHT.avif", alt: "Piscina de noche" },
  { src: "/images/OUTSIDE_NIGHT.avif", alt: "Exterior de noche" },
  { src: "/images/NIGHT_ENTRANCE.avif", alt: "Entrada de noche" },
  { src: "/images/INSIDE_NIGHT.avif", alt: "Interior de noche" },
  { src: "/images/INSIDE_NIGHT_2.avif", alt: "Interior de noche" },
  { src: "/images/INSIDE_NIGHT_3.avif", alt: "Interior de noche" },
];

export default function GaleriaPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-10">
          <p className="tracking-label text-xs text-ink/60 mb-3">Galería</p>
          <h1 className="text-4xl md:text-5xl font-display">
            La casa, en imágenes.
          </h1>
        </header>
        <Lightbox items={PHOTOS} />
      </div>
    </div>
  );
}
