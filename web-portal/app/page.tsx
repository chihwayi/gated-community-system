"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building, Loader2, Shield, User } from "lucide-react";
import { tenantService, Tenant } from "@/services/tenantService";

export default function Home() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTenants = async () => {
      try {
        const data = await tenantService.getPublicTenants();
        if (isMounted) {
          setTenants(data);
        }
      } catch (error) {
        console.error("Failed to fetch tenants", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchTenants();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-6xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            Gated Community System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Select your community to sign in.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {tenants.length === 0 ? (
               <div className="col-span-full text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-slate-400">No communities found. Please contact support.</p>
               </div>
            ) : (
              tenants.map((tenant) => (
                <Link 
                  key={tenant.id}
                  href={`/login?tenant=${tenant.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 p-8 hover:bg-white/10 transition-all border border-white/10 hover:border-cyan-500/50 flex flex-col items-center gap-6 text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-4 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    {tenant.logo_url ? (
                      <img 
                        src={tenant.logo_url} 
                        alt={tenant.name} 
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <Building className="w-12 h-12 text-cyan-400" />
                    )}
                  </div>

                  <div className="space-y-2 z-10">
                    <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {tenant.name}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {tenant.slug}.gated.community
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-400 font-medium mt-auto opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    Enter Portal <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        <div className="pt-12 text-slate-500 text-sm border-t border-white/5 mt-12">
          <p>© 2026 Gated Community System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
