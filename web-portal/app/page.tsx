"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { tenantService, Tenant } from "@/services/tenantService";

export default function Home() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

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

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);
  const currentTenants = filteredTenants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-6xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            Gated Community System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Select your community to sign in.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
            placeholder="Search for your community..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
              {filteredTenants.length === 0 ? (
                <div className="col-span-full text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-slate-400">No communities found matching "{searchQuery}".</p>
                </div>
              ) : (
                currentTenants.map((tenant) => (
                  <Link 
                    key={tenant.id}
                    href={`/${tenant.slug}/login`}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-slate-400 text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        <div className="pt-12 text-slate-500 text-sm border-t border-white/5 mt-12 flex flex-col items-center gap-4">
          <p>© 2026 Gated Community System. All rights reserved.</p>
          <Link href="/platform/login" className="hover:text-slate-300 transition-colors">
            Super Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
