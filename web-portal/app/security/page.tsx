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
  Activity,
  AlertTriangle,
  MapPin,
  Package,
  X
} from "lucide-react";
import { visitorService, Visitor } from "@/services/visitorService";
import { staffService, Staff } from "@/services/staffService";
import { incidentService, Incident } from "@/services/incidentService";
import { securityService } from "@/services/securityService";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function SecurityGuardPage() {
  const { logout } = useAuth();
  const { tenant } = useTenant();
  const [accessCode, setAccessCode] = useState("");
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [staffStatus, setStaffStatus] = useState<'checked_in' | 'checked_out' | 'unknown'>('unknown');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [itemsCarriedIn, setItemsCarriedIn] = useState("");
  const [itemsCarriedOut, setItemsCarriedOut] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, title?: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  React.useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await incidentService.getIncidents();
      // Filter for critical/high priority incidents that are not closed
      const activeIncidents = data.filter(inc => 
        (inc.priority === 'critical' || inc.priority === 'high') && 
        inc.status !== 'closed' && inc.status !== 'resolved'
      );
      setIncidents(activeIncidents);
    } catch (error) {
      console.error("Failed to fetch incidents", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setVisitor(null);
    setStaff(null);
    setItemsCarriedIn("");
    setItemsCarriedOut("");

    try {
      // Try to find visitor first
      try {
        const visitorData = await visitorService.getVisitorByAccessCode(accessCode.trim());
        setVisitor(visitorData);
        return;
      } catch (err) {
        // If not visitor, try staff
        const staffData = await staffService.getStaffByAccessCode(accessCode.trim());
        setStaff(staffData);
        // Fetch attendance status
        try {
          const attendance = await staffService.getAttendance(staffData.id);
          // Sort by check_in_time to ensure we get the latest record
          if (attendance && attendance.length > 0) {
             const sortedAttendance = [...attendance].sort((a, b) => 
               new Date(a.check_in_time).getTime() - new Date(b.check_in_time).getTime()
             );
             const lastRecord = sortedAttendance[sortedAttendance.length - 1];
             // Backend usually returns in order?
             // Let's assume the last one is the latest.
             if (!lastRecord.check_out_time) {
               setStaffStatus('checked_in');
             } else {
               setStaffStatus('checked_out');
             }
          } else {
             setStaffStatus('checked_out'); // Never checked in
          }
        } catch (e) {
          console.error("Failed to fetch staff attendance", e);
          setStaffStatus('unknown');
        }
      }
    } catch (err: any) {
      setError("Invalid Access Code. Entry Not Found.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!visitor && !staff) return;

    setActionLoading(true);
    try {
      if (visitor) {
        await visitorService.checkInVisitor(visitor.id, itemsCarriedIn);
        setNotification({
          type: 'success',
          title: 'Check-In Successful',
          message: `Visitor ${visitor.full_name} has been checked in.`
        });
        // Update visitor state
        setVisitor({ ...visitor, status: 'checked_in', check_in_time: new Date().toISOString(), items_carried_in: itemsCarriedIn });
      } else if (staff) {
        await staffService.checkInStaff(staff.id);
        setNotification({
          type: 'success',
          title: 'Check-In Successful',
          message: `Staff ${staff.full_name} has been checked in.`
        });
        setStaffStatus('checked_in');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        title: 'Check-In Failed',
        message: error.message || 'There was an error processing the check-in.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!visitor && !staff) return;

    setActionLoading(true);
    try {
      if (visitor) {
        await visitorService.checkOutVisitor(visitor.id, itemsCarriedOut);
        setNotification({
          type: 'success',
          title: 'Check-Out Successful',
          message: `Visitor ${visitor.full_name} has been checked out.`
        });
        // Update visitor state
        setVisitor({ ...visitor, status: 'checked_out', check_out_time: new Date().toISOString(), items_carried_out: itemsCarriedOut });
      } else if (staff) {
        await staffService.checkOutStaff(staff.id);
        setNotification({
          type: 'success',
          title: 'Check-Out Successful',
          message: `Staff ${staff.full_name} has been checked out.`
        });
        setStaffStatus('checked_out');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Check-Out Failed',
        message: 'There was an error processing the check-out.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveIncident = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Resolve Incident",
      message: "Are you sure you want to mark this emergency as resolved?",
      onConfirm: async () => {
        try {
          await incidentService.updateStatus(id, 'resolved');
          await fetchIncidents();
          setConfirmDialog(null);
        } catch (error) {
          setNotification({ type: 'error', message: "Failed to resolve incident" });
        }
      }
    });
  };

  const handleLogPatrol = async () => {
    setActionLoading(true);
    if (!navigator.geolocation) {
      setNotification({ type: 'error', message: "Geolocation is not supported by your browser" });
      setActionLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await securityService.createPatrolLog(latitude, longitude, "Regular patrol check");
          setNotification({ type: 'success', message: "Patrol logged successfully" });
        } catch (error) {
          setNotification({ type: 'error', message: "Failed to log patrol" });
        } finally {
          setActionLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setNotification({ type: 'error', message: "Unable to retrieve your location" });
        setActionLoading(false);
      }
    );
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
          {tenant?.logo_url ? (
            <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-1.5 shrink-0 border border-white/10">
                    <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
                 </div>
                 <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">{tenant.name}</h1>
                    <p className="text-xs text-slate-400 font-medium">Gate Security</p>
                 </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/20">
                <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Gate Security</h1>
                <p className="text-xs text-slate-400 font-medium">Entry Control System</p>
                </div>
            </div>
          )}
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
        
        {/* Actions Bar */}
        <div className="flex justify-end mb-6">
            <button
                onClick={handleLogPatrol}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
                <MapPin className="w-5 h-5" />
                {actionLoading ? "Logging..." : "Log Patrol"}
            </button>
        </div>

        {/* SOS Alerts */}
        {incidents.length > 0 && (
          <div className="mb-8 space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-red-600 rounded-3xl p-6 shadow-2xl shadow-red-900/50 border border-red-400 animate-pulse relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-full shrink-0 animate-bounce">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase">SOS EMERGENCY</h3>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
                        {incident.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/90 font-medium text-lg leading-snug mb-3">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-2 text-white/80 bg-black/10 p-2 rounded-lg inline-flex">
                      <MapPin className="w-4 h-4" />
                      <span className="font-mono font-bold">{incident.location || "Location Unknown"}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-white/60 font-mono">
                        Reported: {new Date(incident.created_at).toLocaleTimeString()}
                      </div>
                      <button 
                        onClick={() => handleResolveIncident(incident.id)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-xl transition-colors border border-white/10"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
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
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/5 text-xs text-slate-300 font-medium flex items-center gap-1.5 capitalize">
                      <User className="w-3.5 h-3.5" /> {visitor.visitor_type || 'Visitor'}
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

                {visitor.valid_until && (
                  <div className={`bg-slate-950/50 p-5 rounded-2xl border ${
                    new Date(visitor.valid_until) < new Date() ? 'border-red-500/50 bg-red-950/10' : 'border-white/5'
                  } hover:border-white/10 transition-colors col-span-2`}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Valid Until
                    </p>
                    <div className="flex items-center justify-between">
                        <p className={`font-medium text-lg ${
                            new Date(visitor.valid_until) < new Date() ? 'text-red-400' : 'text-slate-200'
                        }`}>
                            {new Date(visitor.valid_until).toLocaleString()}
                        </p>
                        {new Date(visitor.valid_until) < new Date() && (
                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                                EXPIRED
                            </span>
                        )}
                    </div>
                  </div>
                )}
                
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" /> Items Log
                  </p>
                  <div className="space-y-3">
                    {visitor.items_carried_in && (
                        <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-white/5">
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">IN</span>
                            <span className="text-slate-200">{visitor.items_carried_in}</span>
                        </div>
                    )}
                    {visitor.items_carried_out && (
                        <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-white/5">
                            <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">OUT</span>
                            <span className="text-slate-200">{visitor.items_carried_out}</span>
                        </div>
                    )}
                    {!visitor.items_carried_in && !visitor.items_carried_out && (
                        <span className="text-slate-500 italic text-sm">No items recorded for this visit.</span>
                    )}
                  </div>
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
              <div className="pt-2 space-y-4">
                {visitor.status !== 'checked_in' && visitor.status !== 'checked_out' && (
                  <div className="space-y-3">
                     {visitor.valid_until && new Date(visitor.valid_until) < new Date() ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-200 text-center font-bold flex flex-col items-center justify-center gap-2">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <span className="text-lg">Token Expired</span>
                            <span className="text-sm text-red-400/70 font-normal">This pass is no longer valid for entry.</span>
                        </div>
                     ) : (
                        <>
                             <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                                   <Package className="w-4 h-4" /> Items Carried In
                                </label>
                                <input 
                                    type="text" 
                                    value={itemsCarriedIn}
                                    onChange={(e) => setItemsCarriedIn(e.target.value)}
                                    placeholder="Laptop, Tools, etc. (Optional)"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                                />
                             </div>
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
                        </>
                     )}
                  </div>
                )}
                
                {visitor.status === 'checked_in' && (
                  <div className="space-y-3">
                     <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                           <Package className="w-4 h-4" /> Items Carried Out
                        </label>
                        <input 
                            type="text" 
                            value={itemsCarriedOut}
                            onChange={(e) => setItemsCarriedOut(e.target.value)}
                            placeholder="Laptop, Tools, etc. (Optional)"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                     </div>
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
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Staff Details Card */}
        {staff && (
          <div className="bg-slate-900/80 rounded-3xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-500 backdrop-blur-md">
            {/* Status Banner */}
            <div className={`p-6 text-center relative overflow-hidden ${
              staffStatus === 'checked_in' ? 'bg-emerald-600' :
              'bg-blue-600'
            }`}>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Current Status</span>
                <span className="text-2xl font-black uppercase tracking-widest text-white shadow-sm">
                  {staffStatus === 'checked_in' ? 'PRESENT' : 'NOT PRESENT'}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {staff.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{staff.full_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/5 text-xs text-slate-300 font-medium flex items-center gap-1.5 capitalize">
                      <User className="w-3.5 h-3.5" /> {staff.staff_type}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/5 text-xs text-slate-300 font-medium font-mono">
                      ID: #{staff.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Employer</p>
                  <p className="text-slate-200 font-medium text-lg">House #{staff.employer_id}</p> 
                </div>
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Status</p>
                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                     staff.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                   }`}>
                     {staff.status}
                   </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-4">
                {staffStatus !== 'checked_in' && (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading || staff.status !== 'active'}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {actionLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        Staff Check-In
                      </>
                    )}
                  </button>
                )}
                
                {staffStatus === 'checked_in' && (
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
                        Staff Check-Out
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Notification Modal */}
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {notification.type === 'success' ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {notification.title || (notification.type === 'success' ? 'Success' : 'Error')}
                </h3>
                <p className="text-slate-400 mb-6">{notification.message}</p>
                <button 
                  onClick={() => setNotification(null)}
                  className="w-full py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-400 mb-6">{confirmDialog.message}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
