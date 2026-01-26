"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  X, 
  Loader2, 
  CheckCircle 
} from "lucide-react";
import { userService, User, UserCreate } from "@/services/userService";

export default function ResidentsPage() {
  const [residents, setResidents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserCreate>({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    role: "resident"
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const data = await userService.getResidents();
      setResidents(data);
    } catch (error) {
      console.error("Failed to fetch residents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await userService.createUser(formData);
      await fetchResidents();
      setShowAddModal(false);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone_number: "",
        role: "resident"
      });
    } catch (err: any) {
      setError(err.message || "Failed to create resident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResidents = residents.filter(resident => 
    resident.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.phone_number?.includes(searchQuery)
  );

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Residents <span className="text-cyan-400">Management</span>
          </h1>
          <p className="text-slate-400">Manage community residents and access</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Add Resident
        </button>
      </div>

      {/* Search and Filter */}
      <div className="glass p-4 rounded-2xl mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search residents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
      </div>

      {/* Residents Table */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Resident</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading residents...
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No residents found.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {resident.full_name?.charAt(0) || resident.email.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{resident.full_name || "N/A"}</div>
                          <div className="text-sm text-slate-500">{resident.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Mail className="w-4 h-4" />
                          {resident.email}
                        </div>
                        {resident.phone_number && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Phone className="w-4 h-4" />
                            {resident.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      {resident.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-slate-400 text-sm mono">
                      {new Date(resident.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <button className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Add New Resident</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="+1 234..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Role</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="resident"
                      checked={formData.role === "resident"}
                      onChange={(e) => setFormData({...formData, role: "resident" as any})}
                      className="text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-slate-300">Resident</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="guard"
                      checked={formData.role === "guard"}
                      onChange={(e) => setFormData({...formData, role: "guard" as any})}
                      className="text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-slate-300">Guard</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={(e) => setFormData({...formData, role: "admin" as any})}
                      className="text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-slate-300">Admin</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
