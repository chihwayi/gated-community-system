"use client";

import { useEffect, useState } from 'react';
import { Building2, Users, Activity } from 'lucide-react';
import { tenantService } from '@/services/tenantService';

export default function PlatformDashboard() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await tenantService.getPlatformStats();
        setStats({
          totalTenants: data.total_tenants,
          activeTenants: data.active_tenants,
          totalUsers: data.total_users,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Tenants',
      value: stats.totalTenants,
      icon: Building2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'Active Tenants',
      value: stats.activeTenants,
      icon: Activity,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Platform Overview</h1>
        <p className="text-slate-400 mt-2">Manage all gated communities from one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {isLoading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
