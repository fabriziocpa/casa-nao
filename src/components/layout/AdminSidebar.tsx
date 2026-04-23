"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logos";
import { adminNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-line bg-white/60 h-screen sticky top-0">
      <div className="p-6 border-b border-line">
        <Link href="/admin" aria-label="CASA NAO — Admin">
          <Logo className="h-[54px] w-[160px] text-ink" />
        </Link>
        <p className="tracking-label text-[10px] text-ink/60 mt-2">Panel de administración</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-ink text-bg"
                  : "text-ink/70 hover:bg-sand/60 hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={onSignOut} className="p-4 border-t border-line">
        <button className="w-full text-left tracking-label text-[11px] text-ink/60 hover:text-ink">
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
