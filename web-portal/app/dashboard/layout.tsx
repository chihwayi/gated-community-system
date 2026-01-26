import Sidebar from "@/components/Sidebar";
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
        <div className="pl-64">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
