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
  Shield,
  Megaphone
} from "lucide-react";
import { statsService } from "@/services/statsService";
import { useAuth } from "@/context/AuthContext";
import SubscriptionStats from "@/components/dashboard/SubscriptionStats";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const params = useParams();
  const tenantSlug = params?.tenant as string;
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    visitors: { total: 0, active: 0, pending: 0 },
    incidents: { open: 0 },
    financial: { pending_bills: 0 },
    maintenance: { open_tickets: 0 }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
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
            <Link 
              href={`/${tenantSlug}/dashboard/announcements`}
              className="glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm font-medium">Announcements</span>
            </Link>
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-slate-400 text-sm">Today:</span>
              <span className="text-white font-semibold ml-2 mono">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Stats */}
      <SubscriptionStats />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Stat Card 1: Total Visitors */}
        <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-full">Total</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-white mb-1">{stats.visitors.total}</p>
              <p className="text-sm text-slate-400">Total Visitors</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-400 mb-1">Active: {stats.visitors.active}</p>
              <p className="text-xs text-amber-400">Pending: {stats.visitors.pending}</p>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Open Incidents */}
        <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-full">Alerts</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{stats.incidents.open}</p>
            <p className="text-sm text-slate-400">Open Incidents</p>
          </div>
        </div>

        {/* Stat Card 3: Pending Bills */}
        <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-full">Finance</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{stats.financial.pending_bills}</p>
            <p className="text-sm text-slate-400">Pending Bills</p>
          </div>
        </div>

         {/* Stat Card 4: Maintenance */}
         <div className="stat-card glass rounded-2xl p-6 slide-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-full">Tasks</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{stats.maintenance.open_tickets}</p>
            <p className="text-sm text-slate-400">Open Tickets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
