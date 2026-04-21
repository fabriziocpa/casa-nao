import type { Metadata } from "next";
import { TourVirtualClient } from "./TourVirtualClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tour virtual 360°",
  description: "Recorre CASA NAO.",
};

const TOURS = [
  {
    id: "outside",
    label: "Exterior",
    title: "Fachada y piscina",
    src: "/videos/OUTSIDE_360.webm",
  },
  {
    id: "terrace",
    label: "Terraza",
    title: "Terraza sobre el mar",
    src: "/videos/TOUR_TERRACE_360.webm",
  },
  {
    id: "main-room",
    label: "Cuarto principal",
    title: "Cuarto principal",
    src: "/videos/MAIN_ROOM_1_360.webm",
  },
];

export default function TourVirtualPage() {
  return (
    <div className="pt-24 pb-24 bg-ink text-bg">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-10">
          <p className="tracking-label text-xs text-bg/60 mb-3">Tour 360°</p>
          <h1 className="text-4xl md:text-5xl font-display">
            Explora cada ambiente.
          </h1>
        </header>
        <TourVirtualClient tours={TOURS} />
      </div>
    </div>
  );
}
