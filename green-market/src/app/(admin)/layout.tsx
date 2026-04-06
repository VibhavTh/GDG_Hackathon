import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { Footer } from "@/components/layout/footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer variant="admin" />
      </div>
      <AdminMobileNav />
    </div>
  );
}
