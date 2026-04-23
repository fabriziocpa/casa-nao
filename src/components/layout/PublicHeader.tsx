"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NaoLogo } from "@/components/logos";
import { publicNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [atTop, setAtTop] = useState(true);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let rafId = 0;
    const updateTopState = () => {
      setAtTop(window.scrollY < 8);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateTopState);
    };

    updateTopState();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const transparent = pathname === "/" && atTop && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors",
        transparent
          ? "text-bg bg-transparent"
          : "text-bg bg-ink/80 backdrop-blur-md border-b border-bg/20",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="CASA NAO — Inicio">
          <NaoLogo className="h-[30px] w-[90px] text-bg" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 tracking-label text-xs">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-70 transition">
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className="md:hidden tracking-label text-xs"
          aria-expanded={open}
          aria-label="Menú"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>
      {open ? (
        <div className="md:hidden border-t border-bg/20 bg-ink text-bg">
          <nav className="mx-auto max-w-7xl px-6 py-4 grid gap-3 tracking-label text-xs">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
