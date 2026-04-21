import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { signOut } from "@/features/auth/actions";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg">
      <AdminSidebar onSignOut={signOut} />
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-line bg-white/70">
          <span className="tracking-label text-xs">CASA NAO · Admin</span>
          <form action={signOut}>
            <button className="text-xs underline underline-offset-4">Salir</button>
          </form>
        </header>
        <main className="p-6 md:p-10 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
