"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params?.tenant as string;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        if (tenantSlug) router.push(`/${tenantSlug}/login`);
        else router.push("/");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role or home
        if (user.role === "admin") router.push(`/${tenantSlug}/dashboard`);
        else if (user.role === "resident") router.push(`/${tenantSlug}/resident`);
        else if (user.role === "guard") router.push(`/${tenantSlug}/security`);
        else router.push("/");
      }
    }
  }, [user, isLoading, router, allowedRoles, tenantSlug]);

  // Add timeout for loading state
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => setShowTimeout(true), 5000);
    } else {
      setShowTimeout(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        {showTimeout && (
          <div className="text-center animate-in fade-in duration-500">
            <p className="text-slate-400 mb-2">Connecting to server is taking longer than expected...</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                Reload Page
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = tenantSlug ? `/${tenantSlug}/login` : '/';
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
              >
                Reset & Login
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
