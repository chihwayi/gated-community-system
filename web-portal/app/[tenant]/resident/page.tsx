"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Users, 
  CreditCard, 
  Bell, 
  Settings, 
  LifeBuoy, 
  ChevronRight, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Plus,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  X,
  Dumbbell,
  Briefcase,
  ShoppingBag,
  Car,
  Package,
  Vote,
  AlertCircle
} from "lucide-react";
import { incidentService } from "@/services/incidentService";
import { useAuth } from "@/context/AuthContext";
import FinancialSection from "@/components/resident/FinancialSection";
import HelpdeskSection from "@/components/resident/HelpdeskSection";
import AmenitiesSection from "@/components/resident/AmenitiesSection";
import StaffSection from "@/components/resident/StaffSection";
import MarketplaceSection from "@/components/resident/MarketplaceSection";
import NotificationSection from "@/components/resident/NotificationSection";
import VehiclesSection from "@/components/resident/VehiclesSection";
import ParcelsSection from "@/components/resident/ParcelsSection";
import CommunitySection from "@/components/resident/CommunitySection";
import VisitorSection from "@/components/resident/VisitorSection";
import SettingsSection from "@/components/resident/SettingsSection";
import FamilySection from "@/components/resident/FamilySection";
import { notificationService } from "@/services/notificationService";
import { useTenant } from "@/context/TenantContext";

export default function ResidentPortalPage() {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'visitors' | 'notices' | 'tickets' | 'amenities' | 'staff' | 'marketplace' | 'settings' | 'vehicles' | 'parcels' | 'community' | 'family'>('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSOSLoading, setIsSOSLoading] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosStatus, setSosStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };


  const handleSOS = () => {
    setShowSOSModal(true);
    setSosStatus('idle');
  };

  const confirmSOS = async () => {
    setIsSOSLoading(true);
    try {
      await incidentService.triggerSOS();
      setSosStatus('success');
      setTimeout(() => {
        setShowSOSModal(false);
        setSosStatus('idle');
      }, 3000);
    } catch (error) {
      console.error("Failed to trigger SOS", error);
      setSosStatus('error');
    } finally {
      setIsSOSLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 hidden lg:flex flex-col fixed h-full z-10">
        <div className="mb-10">
          {tenant?.logo_url ? (
            <div className="flex items-center gap-4 p-2 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                 <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-1.5 shrink-0">
                    <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
                 </div>
                 <h1 className="text-lg font-bold text-slate-100 leading-tight line-clamp-2">{tenant.name}</h1>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Estate Portal
                </h1>
            </div>
          )}
          {!tenant?.logo_url && <p className="text-sm text-slate-500 ml-1">Resident Dashboard</p>}
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {[
            { id: 'dashboard', icon: Home, label: "Dashboard" },
            { id: 'visitors', icon: Users, label: "Visitors" },
            { id: 'family', icon: Users, label: "My Family" },
            { id: 'vehicles', icon: Car, label: "Vehicles" },
            { id: 'parcels', icon: Package, label: "Parcels" },
            { id: 'community', icon: Vote, label: "Community Hub" },
            { id: 'payments', icon: CreditCard, label: "Payments" },
            { id: 'staff', icon: Briefcase, label: "Daily Help" },
            { id: 'marketplace', icon: ShoppingBag, label: "Marketplace" },
            { id: 'tickets', icon: LifeBuoy, label: "Helpdesk" },
            { id: 'amenities', icon: Dumbbell, label: "Amenities" },
            { id: 'notices', icon: Bell, label: "Notices" },
            { id: 'settings', icon: Settings, label: "Settings" },
          ].filter(item => {
            if (user?.role === 'family_member') {
              // Minimalistic view for family members
              return !['payments', 'family', 'staff'].includes(item.id);
            }
            return true;
          }).map((item) => {
            const isActive = activeTab === item.id;
            return (
            <button 
              key={item.label}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "text-white shadow-lg shadow-black/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
              style={isActive ? {
                 backgroundColor: 'var(--primary-brand, #06b6d4)',
              } : {}}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
              }`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              )}
            </button>
          )})}
        </nav>
        
        <div className="mt-8">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-slate-100 font-semibold text-sm mb-1 relative z-10">Need Help?</p>
            <p className="text-slate-400 text-xs mb-4 relative z-10">Contact estate management 24/7</p>
            <button 
              onClick={() => setActiveTab('tickets')}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-lg py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2 relative z-10"
            >
              <LifeBuoy className="w-4 h-4" />
              Contact Support
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 p-4 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Welcome back, {user?.full_name?.split(' ')[0] || 'Resident'}!</h2>
              <p className="text-slate-400 mt-1">Here's what's happening with your property today.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSOS}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 hover:text-red-400 transition-all"
                title="Emergency SOS"
              >
                <AlertTriangle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTab('notices')}
                className="relative p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800"></span>
                )}
              </button>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-200">{user?.full_name || 'Resident'}</p>
                  <p className="text-xs text-slate-500 font-mono">{user?.house_address || `House #${user?.id || '?'}`}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm ring-4 ring-slate-900/50">
                  {user?.full_name ? user.full_name.charAt(0) : 'R'}
                </div>
                <button 
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-red-500/20 border border-white/5 text-slate-400 hover:text-red-400 transition-all ml-2"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: "Account Status", value: "Paid Up", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "Visitors Today", value: "4", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Next Payment", value: "$450", icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "New Notices", value: unreadCount.toString(), icon: Bell, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            ].filter(stat => {
              if (user?.role === 'family_member') {
                return !['Account Status', 'Next Payment'].includes(stat.label);
              }
              return true;
            }).map((stat) => (
              <div 
                key={stat.label}
                className="group p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all hover:bg-slate-800/50 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 p-20 ${stat.bg} blur-3xl rounded-full -mr-10 -mt-10 opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className={`${activeTab === 'dashboard' ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-8`}>
              {activeTab === 'payments' ? (
                <FinancialSection />
              ) : activeTab === 'tickets' ? (
                <HelpdeskSection />
              ) : activeTab === 'amenities' ? (
                <AmenitiesSection />
              ) : activeTab === 'staff' ? (
                <StaffSection />
              ) : activeTab === 'marketplace' ? (
                <MarketplaceSection />
              ) : activeTab === 'notices' ? (
                <NotificationSection />
              ) : activeTab === 'vehicles' ? (
                <VehiclesSection />
              ) : activeTab === 'parcels' ? (
                <ParcelsSection />
              ) : activeTab === 'community' ? (
                <CommunitySection />
              ) : activeTab === 'settings' ? (
                <SettingsSection />
              ) : activeTab === 'visitors' ? (
                <VisitorSection />
              ) : activeTab === 'family' ? (
                <FamilySection />
              ) : (
                <VisitorSection />
              )}
            </div>

            {/* Right Column - Quick Actions & Notices */}
            {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Panic Button */}
              <div className="rounded-2xl bg-gradient-to-br from-red-900/50 to-red-950/50 border border-red-500/30 p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-500/20 blur-3xl rounded-full" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-lg font-bold text-red-100 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Emergency
                  </h3>
                  <div className="p-2 rounded-lg bg-red-500/20 backdrop-blur-md">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                </div>

                <p className="text-red-200/80 text-sm mb-6 relative z-10">
                  Pressing this button will instantly alert the guard house and security team.
                </p>
                
                <button 
                  onClick={handleSOS}
                  disabled={isSOSLoading}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/40 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                >
                  {isSOSLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      TRIGGER SOS ALERT
                    </>
                  )}
                </button>
              </div>

              {/* Quick Pay Card */}
              {user?.role !== 'family_member' && (
              <div className="rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500/30 blur-3xl rounded-full" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-lg font-bold text-white">Quick Pay</h3>
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                    <CreditCard className="w-5 h-5 text-indigo-300" />
                  </div>
                </div>
                
                <div className="mb-8 relative z-10">
                  <p className="text-indigo-200 text-sm mb-1">Total Due</p>
                  <p className="text-4xl font-bold text-white font-mono tracking-tight">$450.00</p>
                </div>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Levy</span>
                    <span className="font-mono text-white">$350.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Water</span>
                    <span className="font-mono text-white">$100.00</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="font-mono text-white">$450.00</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveTab('payments')}
                  className="w-full bg-white text-indigo-950 font-bold py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20 relative z-10"
                >
                  Pay Now
                </button>
              </div>
              )}

              {/* Notices */}
              <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-lg font-bold text-slate-100">Latest Notices</h3>
                </div>
                <div className="p-4 space-y-4">
                  {[
                    { title: "Gate Maintenance", desc: "Main gate closed for repairs Sunday 10am-2pm.", time: "Today, 9:00 AM", type: "alert" },
                    { title: "Community Meeting", desc: "Monthly residents meeting at the community hall.", time: "Yesterday", type: "info" }
                  ].map((notice, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950/30 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notice.type === 'alert' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {notice.type === 'alert' ? <AlertCircle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-200 text-sm">{notice.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notice.desc}</p>
                          <p className="text-[10px] text-slate-600 mt-2 font-mono uppercase tracking-wider">{notice.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
        {/* SOS Confirmation Modal */}
        {showSOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setShowSOSModal(false)} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-500/20 blur-3xl rounded-full" />
              
              {sosStatus === 'idle' && (
                <>
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="p-3 bg-red-500/10 rounded-full animate-pulse">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Emergency Alert</h2>
                      <p className="text-red-200/70 text-sm">Confirm SOS Trigger</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-8 relative z-10 leading-relaxed">
                    Are you sure you want to trigger an SOS? This will immediately alert security personnel and record your location.
                    <span className="block mt-2 text-red-400 font-medium">Use only in case of emergency.</span>
                  </p>
                  
                  <div className="flex gap-3 relative z-10">
                    <button 
                      onClick={() => setShowSOSModal(false)}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmSOS}
                      disabled={isSOSLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isSOSLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                          CONFIRM SOS
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {sosStatus === 'success' && (
                <div className="text-center py-6 relative z-10">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Help is on the way!</h2>
                  <p className="text-slate-400">Security has been notified of your location.</p>
                </div>
              )}

              {sosStatus === 'error' && (
                <div className="text-center py-6 relative z-10">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Alert Failed</h2>
                  <p className="text-slate-400 mb-6">Could not trigger automatic alert.</p>
                  <button 
                    onClick={() => setShowSOSModal(false)}
                    className="py-2 px-6 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              )}
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
                  {notification.type === 'success' ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {notification.type === 'success' ? 'Success' : 'Error'}
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
      </main>
    </div>
  );
}


