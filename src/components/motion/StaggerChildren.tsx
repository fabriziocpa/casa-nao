"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
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
      { rootMargin: "-60px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !visible) return;
    const items = el.children;
    for (let i = 0; i < items.length; i++) {
      (items[i] as HTMLElement).style.transitionDelay = `${i * stagger}s`;
    }
  }, [visible, stagger]);

  return (
    <div ref={ref} className={className} data-stagger={visible ? "in" : ""}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
