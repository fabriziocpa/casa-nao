"use client";

import { useEffect, useRef, useState } from "react";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

export function RoomCard({
  videoSrc,
  poster,
  view,
  name,
  detail,
}: {
  videoSrc?: string;
  poster?: string;
  view: string;
  name: string;
  detail: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const autoplay = Boolean(videoSrc && !poster);

  useEffect(() => {
    if (!autoplay || reduced || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay, reduced]);

  if (!videoSrc) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand p-6 flex flex-col justify-end">
        <p className="tracking-label text-[10px] text-ink/60">
          {view || "Habitación"}
        </p>
        <h3 className="font-display text-2xl mt-2 text-ink">{name}</h3>
        <p className="text-sm text-ink/70 mt-1">{detail}</p>
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand"
      onMouseEnter={() => {
        if (autoplay || reduced) return;
        ref.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        if (autoplay) return;
        ref.current?.pause();
      }}
    >
      {!reduced ? (
        <video
          ref={ref}
          src={videoSrc}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className={
            poster
              ? "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] opacity-0 group-hover:opacity-100"
              : "absolute inset-0 w-full h-full object-cover"
          }
        />
      ) : null}
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-bg">
        <p className="tracking-label text-[10px] text-bg/80">
          {view || "Habitación"}
        </p>
        <h3 className="font-display text-2xl mt-1">{name}</h3>
        <p className="text-sm text-bg/80 mt-1">{detail}</p>
      </div>
    </div>
  );
}
