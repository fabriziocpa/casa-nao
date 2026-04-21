"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Item = { src: string; alt: string; width?: number | null; height?: number | null };

export function Lightbox({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, prev, next]);

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map((it, i) => (
          <li key={it.src} className="relative aspect-[4/5] overflow-hidden rounded-md">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="block w-full h-full group"
              aria-label={`Abrir imagen: ${it.alt}`}
            >
              <Image
                src={it.src}
                alt={it.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 text-bg tracking-label text-xs"
            aria-label="Cerrar"
          >
            Cerrar ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 text-bg text-3xl"
            aria-label="Anterior"
          >
            ‹
          </button>
          <div
            className="relative w-full max-w-5xl aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={items[openIndex].src}
              alt={items[openIndex].alt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 text-bg text-3xl"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      ) : null}
    </>
  );
}
