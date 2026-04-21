"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type As = "div" | "section" | "article";

export function FadeIn({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: As;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={className}
      data-reveal={visible ? "in" : ""}
      style={delay ? ({ ["--reveal-delay"]: `${delay * 1000}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
