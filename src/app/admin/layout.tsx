import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminMobileMenu } from "@/components/layout/AdminMobileMenu";
import { signOut } from "@/features/auth/actions";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg">
      <AdminSidebar onSignOut={signOut} />
      <div className="flex-1 min-w-0">
        <AdminMobileMenu onSignOut={signOut} />
        <main className="p-4 md:p-10 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
