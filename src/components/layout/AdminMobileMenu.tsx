"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function AdminMobileMenu({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current = useMemo(
    () =>
      adminNav.find((item) =>
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
      ) ?? adminNav[0],
    [pathname],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Sticky mobile header */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-line bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="tracking-label text-[10px] text-ink/50 shrink-0">CASA NAO</span>
          <span className="text-ink/30 text-xs">/</span>
          <span className="text-sm font-medium text-ink truncate">{current.label}</span>
        </div>
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="rounded-full border border-line p-2 text-ink/70 hover:bg-sand/40 transition shrink-0"
        >
          <MenuIcon />
        </button>
      </header>

      {/* Side drawer */}
      {open ? (
        <div
          className="md:hidden fixed inset-0 z-[110] bg-ink/45 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <p className="tracking-label text-[11px] text-ink/60">Navegación</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-ink/60 hover:bg-sand/40 transition"
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {adminNav.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                      active
                        ? "bg-ink text-bg font-medium"
                        : "text-ink/70 hover:bg-sand/40 hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <form action={onSignOut} className="p-4 border-t border-line">
              <button className="w-full rounded-xl border border-line py-2.5 tracking-label text-[11px] text-ink/70 hover:bg-sand/30 transition">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
