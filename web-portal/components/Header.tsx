"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get current page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // Handle special cases
    if (!lastSegment || lastSegment === "dashboard") return "Overview";
    
    // Format title: "resident-management" -> "Resident Management"
    return lastSegment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  };

  return (
    <header className="sticky top-0 z-40 w-full h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 transition-all duration-300">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-100">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-200 transition-colors" />
            <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 w-64 transition-all"
            />
        </div>

        <button className="relative p-2.5 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </button>

        <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block"></div>

        <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-200">{user?.full_name || "User"}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role?.replace("_", " ") || "Admin"}</p>
            </div>
            <div 
                className="w-10 h-10 rounded-xl border border-slate-700/50 flex items-center justify-center overflow-hidden shadow-lg"
                style={{
                    background: user?.profile_picture_url ? 'transparent' : `linear-gradient(135deg, var(--primary-brand, #334155), var(--accent-brand, #0f172a))`
                }}
            >
                {user?.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-white font-bold text-lg">
                        {user?.full_name?.[0]?.toUpperCase() || "U"}
                    </span>
                )}
            </div>
        </div>
      </div>
    </header>
  );
}
