"use client";

import React, { useState } from "react";
import { 
  Shield, 
  Search, 
  User, 
  Car, 
  Clock, 
  CheckCircle, 
  LogOut,
  ScanLine,
  Activity
} from "lucide-react";
import { visitorService, Visitor } from "@/services/visitorService";
import { useAuth } from "@/context/AuthContext";

export default function SecurityGuardPage() {
  const { logout } = useAuth();
  const [accessCode, setAccessCode] = useState("");
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setVisitor(null);

    try {
      const data = await visitorService.getVisitorByAccessCode(accessCode.trim());
      setVisitor(data);
    } catch (err: any) {
      setError(err.message || "Visitor not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!visitor) return;
    setActionLoading(true);
    try {
      const updatedVisitor = await visitorService.checkInVisitor(visitor.id);
      setVisitor(updatedVisitor);
      // alert("Visitor Checked In Successfully!"); // Removed alert for smoother UI
    } catch (err: any) {
      alert(err.message || "Failed to check in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!visitor) return;
    setActionLoading(true);
    try {
      const updatedVisitor = await visitorService.checkOutVisitor(visitor.id);
      setVisitor(updatedVisitor);
      // alert("Visitor Checked Out Successfully!"); // Removed alert for smoother UI
    } catch (err: any) {
      alert(err.message || "Failed to check out");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-4 sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Gate Security</h1>
              <p className="text-xs text-slate-400 font-medium">Entry Control System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
            </div>
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">System Online</span>
          </div>
          
          <button 
            onClick={logout}
            className="ml-4 p-2 rounded-lg bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-2xl">
        
        {/* Search Section */}
        <div className="bg-slate-900/50 rounded-3xl p-8 shadow-2xl border border-white/5 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-200">
            <ScanLine className="w-5 h-5 text-blue-400" />
            Verify Access Code
          </h2>
          
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="relative w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl px-4 py-6 text-center text-4xl tracking-[0.2em] font-mono text-white placeholder-slate-700 outline-none transition-all shadow-inner uppercase"
            />
            <button
              type="submit"
              disabled={isLoading || !accessCode}
              className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
               {error}
            </div>
          )}
        </div>

        {/* Visitor Details Card */}
        {visitor && (
          <div className="bg-slate-900/80 rounded-3xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-500 backdrop-blur-md">
            {/* Status Banner */}
            <div className={`p-6 text-center relative overflow-hidden ${
              visitor.status === 'checked_in' ? 'bg-emerald-600' :
              visitor.status === 'checked_out' ? 'bg-slate-700' :
              visitor.status === 'denied' ? 'bg-red-600' :
              'bg-blue-600'
            }`}>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Current Status</span>
                <span className="text-2xl font-black uppercase tracking-widest text-white shadow-sm">
                  {visitor.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {visitor.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{visitor.full_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/5 text-xs text-slate-300 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Visitor
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/5 text-xs text-slate-300 font-medium font-mono">
                      ID: #{visitor.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Host</p>
                  <p className="text-slate-200 font-medium text-lg">House #89</p> 
                </div>
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Vehicle</p>
                  <p className="text-slate-200 font-medium text-lg flex items-center gap-2">
                    <Car className="w-5 h-5 text-slate-400" />
                    {visitor.vehicle_number || "None"}
                  </p>
                </div>
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Purpose</p>
                  <p className="text-slate-200 font-medium text-lg">{visitor.purpose || "Visit"}</p>
                </div>
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Expected Arrival</p>
                    <p className="text-slate-200 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {visitor.expected_arrival ? new Date(visitor.expected_arrival).toLocaleString() : "Anytime"}
                    </p>
                  </div>
                  {visitor.check_in_time && (
                    <div className="text-right">
                       <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Checked In</p>
                       <p className="text-emerald-400 font-mono text-sm">
                         {new Date(visitor.check_in_time).toLocaleTimeString()}
                       </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {visitor.status !== 'checked_in' && visitor.status !== 'checked_out' && (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {actionLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        Approve Check-In
                      </>
                    )}
                  </button>
                )}
                
                {visitor.status === 'checked_in' && (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-slate-900/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {actionLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                        Process Check-Out
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
