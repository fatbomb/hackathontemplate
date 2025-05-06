import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardNav } from "@/components/dashboard/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNav />
      <div className="flex-1 items-start md:gap-6 lg:gap-10 md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] container">
        <aside className="hidden md:block top-14 z-30 fixed md:sticky -ml-2 w-full h-[calc(100vh-3.5rem)] shrink-0">
          <DashboardSidebar />
        </aside>
        <main className="flex flex-col py-6 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}