"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Shield, 
  CheckCircle,
  XCircle,
  Briefcase,
  User,
  Phone,
  Ban,
  Trash2
} from "lucide-react";
import { staffService, Staff, StaffStatus, StaffType } from "@/services/staffService";
import { formatDate } from "@/lib/utils";

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await staffService.getMyStaff();
      setStaffList(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: StaffStatus) => {
    if (!confirm(`Are you sure you want to change status to ${status}?`)) return;
    
    setIsSubmitting(true);
    try {
      await staffService.updateStaff(id, { status });
      await fetchStaff();
    } catch (error) {
      console.error("Failed to update staff status:", error);
      alert("Failed to update staff status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff member? This cannot be undone.")) return;
    try {
      await staffService.deleteStaff(id);
      fetchStaff();
    } catch (error) {
      console.error("Failed to delete staff:", error);
      alert("Failed to delete staff");
    }
  };

  const filteredStaff = staffList.filter(staff =>  
    staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.phone_number.includes(searchQuery) ||
    staff.staff_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: StaffStatus) => {
    switch (status) {
      case StaffStatus.ACTIVE: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case StaffStatus.INACTIVE: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
      case StaffStatus.BLACKLISTED: return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Staff <span className="text-cyan-400">Management</span>
          </h1>
          <p className="text-slate-400">Manage daily help staff (Maids, Drivers, etc.)</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass p-4 rounded-2xl mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Staff Details</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Access Code</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Registered</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    Loading staff...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No staff found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{staff.full_name}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Phone className="w-3 h-3" />
                            {staff.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300 capitalize">{staff.staff_type}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(staff.status)}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <code className="px-2 py-1 bg-slate-900 rounded text-cyan-400 font-mono text-sm">
                        {staff.access_code || 'N/A'}
                      </code>
                    </td>
                    <td className="p-6 text-slate-400 text-sm">
                      {formatDate(staff.created_at)}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {staff.status !== StaffStatus.ACTIVE && (
                          <button 
                            onClick={() => handleStatusUpdate(staff.id, StaffStatus.ACTIVE)}
                            className="p-2 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                            title="Activate"
                            disabled={isSubmitting}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {staff.status === StaffStatus.ACTIVE && (
                          <button 
                            onClick={() => handleStatusUpdate(staff.id, StaffStatus.INACTIVE)}
                            className="p-2 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                            title="Deactivate"
                            disabled={isSubmitting}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        {staff.status !== StaffStatus.BLACKLISTED && (
                          <button 
                            onClick={() => handleStatusUpdate(staff.id, StaffStatus.BLACKLISTED)}
                            className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Blacklist"
                            disabled={isSubmitting}
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        )}
                         <button 
                            onClick={() => handleDelete(staff.id)}
                            className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
