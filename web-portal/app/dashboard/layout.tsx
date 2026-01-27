import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-outfit">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col relative">
          <Header />
          <main className="flex-1 relative z-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
