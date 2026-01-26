"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  AlertCircle, 
  UserPlus, 
  FileText, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Shield
} from "lucide-react";
import { visitorService, Visitor } from "@/services/visitorService";

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    denied: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await visitorService.getAllVisitors();
      setVisitors(data);
      
      // Calculate stats
      const active = data.filter(v => v.status === 'checked_in').length;
      const pending = data.filter(v => v.status === 'pending').length;
      const denied = data.filter(v => v.status === 'denied').length;
      
      setStats({
        total: data.length,
        active,
        pending,
        denied
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'checked_out': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'denied': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="dashboard-body min-h-screen p-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 slide-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="gradient-text">Estate Manager</span> Dashboard
            </h1>
            <p className="text-slate-400 text-sm mono">Real-time monitoring & management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-slate-400 text-sm">Today:</span>
              <span className="text-white font-semibold ml-2 mono">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              EM
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Stat Card 1: Total Visitors */}
        <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="badge bg-blue-500/20 text-blue-300">All Time</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Total Visitors</h3>
          <p className="text-3xl font-bold text-white mono">{stats.total}</p>
        </div>

        {/* Stat Card 2: Active Visitors */}
        <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <span className="badge bg-emerald-500/20 text-emerald-300">On Site</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Active Visitors</h3>
          <p className="text-3xl font-bold text-white mono">{stats.active}</p>
        </div>

        {/* Stat Card 3: Pending Approvals */}
        <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="badge bg-amber-500/20 text-amber-300">Pending</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Upcoming / Pending</h3>
          <p className="text-3xl font-bold text-white mono">{stats.pending}</p>
        </div>

        {/* Stat Card 4: Denied/Issues */}
        <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="badge bg-red-500/20 text-red-300">Issues</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Denied / Flagged</h3>
          <p className="text-3xl font-bold text-white mono">{stats.denied}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visitors List */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10 text-slate-500">Loading activity...</div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No recent activity found.</div>
            ) : (
              visitors.slice(0, 5).map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getStatusColor(visitor.status)}`}>
                      {visitor.status === 'checked_in' ? <CheckCircle className="w-5 h-5" /> :
                       visitor.status === 'checked_out' ? <LogOut className="w-5 h-5" /> :
                       visitor.status === 'denied' ? <XCircle className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{visitor.full_name}</p>
                      <p className="text-xs text-slate-400 mono">
                        {visitor.vehicle_number ? `Vehicle: ${visitor.vehicle_number}` : 'No Vehicle'} • {visitor.purpose}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      visitor.status === 'checked_in' ? 'bg-emerald-500/20 text-emerald-400' :
                      visitor.status === 'checked_out' ? 'bg-slate-500/20 text-slate-400' :
                      visitor.status === 'denied' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {visitor.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(visitor.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Notices */}
        <div className="glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.7s" }}>
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/dashboard/residents" className="w-full p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all group flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Add Resident</p>
                <p className="text-xs text-slate-400">Register new property owner</p>
              </div>
            </a>

            <a href="/dashboard/guards" className="w-full p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500/50 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all group flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Add Guard</p>
                <p className="text-xs text-slate-400">Register security personnel</p>
              </div>
            </a>
            
            <button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Broadcast Notice</p>
                <p className="text-xs text-slate-400">Send alert to all residents</p>
              </div>
            </button>

            <button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Payment Report</p>
                <p className="text-xs text-slate-400">View collection status</p>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Database</span>
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Gate Sensors</span>
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
