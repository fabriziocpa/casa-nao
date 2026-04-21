"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/media/VideoPlayer";

type Tour = {
  id: string;
  label: string;
  title: string;
  src: string;
};

export function TourVirtualClient({ tours }: { tours: Tour[] }) {
  const [activeId, setActiveId] = useState(tours[0]?.id ?? "");
  const active = tours.find((t) => t.id === activeId) ?? tours[0];

  if (!active) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tours.map((tour) => (
          <button
            key={tour.id}
            type="button"
            onClick={() => setActiveId(tour.id)}
            aria-pressed={tour.id === active.id}
            className={
              "tracking-label text-xs rounded-full px-4 py-2 border transition " +
              (tour.id === active.id
                ? "bg-bg text-ink border-bg"
                : "border-bg/30 text-bg/80 hover:border-bg/70")
            }
          >
            {tour.label}
          </button>
        ))}
      </div>
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-ink">
        <VideoPlayer
          key={active.id}
          src={active.src}
          controls
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-bg/60 text-sm">{active.title}</p>
    </div>
  );
}
