"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  muted?: boolean;
  autoPlayOnView?: boolean;
};

export function VideoPlayer({
  src,
  poster,
  className,
  controls = true,
  muted = true,
  autoPlayOnView = false,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!autoPlayOnView || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlayOnView]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      controls={controls}
      muted={muted}
      playsInline
      preload="metadata"
      data-inview={inView || undefined}
    />
  );
}
