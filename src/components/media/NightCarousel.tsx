"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NightSlide = {
  src: string;
  alt: string;
};

export function NightCarousel({ slides }: { slides: NightSlide[] }) {
  const [active, setActive] = useState(0);

  const prev = () => {
    setActive((current) => (current - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setActive((current) => (current + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[70svh] min-h-[460px] md:min-h-[620px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            index === active ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          aria-hidden={index !== active}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
        </div>
      ))}

      <button
        type="button"
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-bg/35 bg-ink/30 text-bg text-2xl backdrop-blur-sm hover:bg-ink/45 transition"
        aria-label="Imagen anterior"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-bg/35 bg-ink/30 text-bg text-2xl backdrop-blur-sm hover:bg-ink/45 transition"
        aria-label="Siguiente imagen"
      >
        ›
      </button>

      <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-2 px-6">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === active ? "w-9 bg-bg" : "w-4 bg-bg/45 hover:bg-bg/65",
            )}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
