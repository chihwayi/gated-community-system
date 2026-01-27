"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileBarChart, 
  CreditCard, 
  Bell, 
  AlertTriangle, 
  LogOut, 
  LifeBuoy, 
  Dumbbell,
  Car,
  Package,
  Vote,
  FileText,
  User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { tenant } = useTenant();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Residents", href: "/dashboard/residents", icon: Users },
    { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
    { name: "Parcels", href: "/dashboard/parcels", icon: Package },
    { name: "Polls", href: "/dashboard/polls", icon: Vote },
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Guards", href: "/dashboard/guards", icon: Users },
    { name: "Security", href: "/dashboard/security", icon: Shield },
    { name: "Reports", href: "/dashboard/reports", icon: FileBarChart },
    { name: "Financials", href: "/dashboard/financial", icon: CreditCard },
    { name: "Notices", href: "/dashboard/notices", icon: Bell },
    { name: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
    { name: "Helpdesk", href: "/dashboard/tickets", icon: LifeBuoy },
    { name: "Amenities", href: "/dashboard/amenities", icon: Dumbbell },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        {tenant?.logo_url ? (
            <div className="flex items-center gap-4 p-2 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                 <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-1.5 shrink-0">
                    <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
                 </div>
                 <h1 className="text-lg font-bold text-slate-100 leading-tight line-clamp-2">{tenant.name}</h1>
            </div>
        ) : (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent px-2">
            {tenant?.name || "Gated Community"}
            </h1>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto min-h-0 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                isActive
                  ? "text-white shadow-lg shadow-black/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
              style={isActive ? {
                backgroundColor: 'var(--primary-brand, #06b6d4)',
              } : {}}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/10" />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="font-medium relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
