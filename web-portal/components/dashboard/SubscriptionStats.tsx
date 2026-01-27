"use client";

import { useState, useEffect } from "react";
import { tenantService, TenantUsage } from "@/services/tenantService";
import { Shield, Users, UserCheck, Crown } from "lucide-react";

export default function SubscriptionStats() {
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const data = await tenantService.getTenantUsage();
      setUsage(data);
    } catch (error) {
      console.error("Failed to fetch tenant usage", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-48 bg-slate-800/50 rounded-2xl"></div>;
  if (!usage) return null;

  const calculatePercentage = (current: number, max: number) => {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getProgressColor = (current: number, max: number) => {
    const percentage = calculatePercentage(current, max);
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
                <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Subscription Status</h2>
                <p className="text-slate-400 text-sm">
                    Current Plan: <span className="text-purple-400 font-semibold capitalize">{usage.plan || "Free"}</span>
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admins */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-300 font-medium">Admins</span>
                </div>
                <span className="text-xs text-slate-500">
                    {usage.usage.admins} / {usage.limits.max_admins}
                </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${getProgressColor(usage.usage.admins, usage.limits.max_admins)}`}
                    style={{ width: `${calculatePercentage(usage.usage.admins, usage.limits.max_admins)}%` }}
                />
            </div>
        </div>

        {/* Guards */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300 font-medium">Guards</span>
                </div>
                <span className="text-xs text-slate-500">
                    {usage.usage.guards} / {usage.limits.max_guards}
                </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${getProgressColor(usage.usage.guards, usage.limits.max_guards)}`}
                    style={{ width: `${calculatePercentage(usage.usage.guards, usage.limits.max_guards)}%` }}
                />
            </div>
        </div>

        {/* Residents */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300 font-medium">Residents</span>
                </div>
                <span className="text-xs text-slate-500">
                    {usage.usage.residents} / {usage.limits.max_residents}
                </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${getProgressColor(usage.usage.residents, usage.limits.max_residents)}`}
                    style={{ width: `${calculatePercentage(usage.usage.residents, usage.limits.max_residents)}%` }}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
