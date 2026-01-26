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
  ShieldCheck
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { visitorService, Visitor } from "@/services/visitorService";
import { useAuth } from "@/context/AuthContext";

export default function ResidentPortalPage() {
  const { user, logout } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    purpose: "",
    expected_arrival_date: "",
    expected_arrival_time: ""
  });
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const data = await visitorService.getMyVisitors();
      setVisitors(data.reverse()); // Show newest first
    } catch (error) {
      console.error("Failed to fetch visitors", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let expected_arrival = undefined;
      if (formData.expected_arrival_date && formData.expected_arrival_time) {
        expected_arrival = `${formData.expected_arrival_date}T${formData.expected_arrival_time}:00`;
      }

      const newVisitor = await visitorService.createVisitor({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        purpose: formData.purpose,
        expected_arrival: expected_arrival,
        host_id: 1 // Hardcoded host
      });

      setGeneratedCode(newVisitor.access_code);
      setFormData({
        full_name: "",
        phone_number: "",
        purpose: "",
        expected_arrival_date: "",
        expected_arrival_time: ""
      });
      fetchVisitors();
    } catch (error) {
      console.error("Failed to register visitor", error);
      alert("Failed to register visitor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 hidden lg:flex flex-col fixed h-full z-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Estate Portal
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-1">Resident Dashboard</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { icon: Home, label: "Dashboard", active: true },
            { icon: Users, label: "Visitors", active: false },
            { icon: CreditCard, label: "Payments", active: false },
            { icon: Bell, label: "Notices", active: false },
            { icon: Settings, label: "Settings", active: false },
          ].map((item) => (
            <a 
              key={item.label}
              href="#" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                item.active 
                  ? "bg-cyan-500/10 text-cyan-400 font-medium" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                item.active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
              }`} />
              <span>{item.label}</span>
              {item.active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              )}
            </a>
          ))}
        </nav>
        
        <div className="mt-8">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-slate-100 font-semibold text-sm mb-1 relative z-10">Need Help?</p>
            <p className="text-slate-400 text-xs mb-4 relative z-10">Contact estate management 24/7</p>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-lg py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2 relative z-10">
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
              <button className="relative p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800"></span>
              </button>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-200">{user?.full_name || 'Resident'}</p>
                  <p className="text-xs text-slate-500 font-mono">House #{user?.id || '?'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm ring-4 ring-slate-900/50">
                  {user?.full_name ? user.full_name.charAt(0) : 'R'}
                </div>
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: "Account Status", value: "Paid Up", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "Visitors Today", value: "4", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Next Payment", value: "$450", icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "New Notices", value: "2", icon: Bell, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            ].map((stat) => (
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Visitor Registration Form */}
              <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-cyan-400" />
                    Register New Visitor
                  </h3>
                </div>
                
                <div className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Visitor Name</label>
                        <input 
                          type="text" 
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. John Doe" 
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. +263 77 123 4567" 
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Visit Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-600" />
                          <input 
                            type="date" 
                            name="expected_arrival_date"
                            value={formData.expected_arrival_date}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Expected Time</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-600" />
                          <input 
                            type="time" 
                            name="expected_arrival_time"
                            value={formData.expected_arrival_time}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono [color-scheme:dark]" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 ml-1">Purpose of Visit</label>
                      <textarea 
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        rows={3} 
                        placeholder="e.g. Social visit, delivery, contractor..." 
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                          Generate Access Code
                        </>
                      )}
                    </button>
                  </form>

                  {/* Generated Code Display */}
                  {generatedCode && (
                    <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
                        <ShieldCheck className="w-5 h-5" />
                        <span>Access Code Generated Successfully</span>
                      </div>
                      
                      <div className="p-4 bg-white rounded-xl shadow-lg mb-4">
                        <QRCodeSVG value={generatedCode} size={160} level="H" />
                      </div>
                      
                      <div className="text-center space-y-2">
                        <p className="text-4xl font-bold font-mono text-emerald-400 tracking-wider tabular-nums">
                          {generatedCode}
                        </p>
                        <p className="text-sm text-emerald-500/80">Share this code or QR with your visitor</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Visitors List */}
              <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-100">Recent Visitors</h3>
                  <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-2">
                  {visitors.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No visitors found</p>
                    </div>
                  ) : (
                    visitors.map((visitor) => (
                      <div 
                        key={visitor.id} 
                        className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                            visitor.status === 'checked_in' 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                              : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10'
                          }`}>
                            {visitor.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{visitor.full_name}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{visitor.phone_number}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            visitor.status === 'checked_in' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : visitor.status === 'checked_out'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              visitor.status === 'checked_in' ? 'bg-emerald-400 animate-pulse' : 
                              visitor.status === 'checked_out' ? 'bg-slate-500' : 'bg-blue-400'
                            }`} />
                            {visitor.status === 'checked_in' ? 'Inside' : 
                             visitor.status === 'checked_out' ? 'Left' : 
                             'Pending'}
                          </span>
                          <p className="text-xs text-slate-600 mt-1.5 font-mono">
                            {new Date(visitor.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Notices */}
            <div className="space-y-8">
              {/* Quick Pay Card */}
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
                
                <button className="w-full bg-white text-indigo-950 font-bold py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20 relative z-10">
                  Pay Now
                </button>
              </div>

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
          </div>
        </div>
      </main>
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
