"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  MapPin, 
  Clock,
  CheckCircle,
  X, 
  Loader2, 
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { incidentService, Incident } from "@/services/incidentService";
import { useAuth } from "@/context/AuthContext";

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: ""
  });

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await incidentService.createIncident({
        title: formData.title,
        description: formData.description,
        location: formData.location
      });
      await fetchIncidents();
      setShowReportModal(false);
      setFormData({
        title: "",
        description: "",
        location: ""
      });
    } catch (err: any) {
      setError(err.message || "Failed to report incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await incidentService.updateStatus(id, newStatus);
      await fetchIncidents();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredIncidents = incidents
    .filter(incident => {
      const matchesSearch = 
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority === "all" || incident.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      // Sort by priority (critical first) then date (newest first)
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const pA = priorityOrder[a.priority || 'medium'] ?? 2;
      const pB = priorityOrder[b.priority || 'medium'] ?? 2;
      
      if (pA !== pB) return pA - pB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'in_progress': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'resolved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'closed': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-white bg-red-600 border-red-500 animate-pulse';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Incident <span className="text-cyan-400">Reporting</span>
          </h1>
          <p className="text-slate-400">Report and track community incidents</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Report Incident
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'critical', label: 'Critical', icon: AlertTriangle },
            { id: 'high', label: 'High', icon: AlertCircle },
            { id: 'medium', label: 'Medium', icon: AlertCircle },
            { id: 'low', label: 'Low', icon: AlertCircle },
          ].map((priority) => (
            <button
              key={priority.id}
              onClick={() => setFilterPriority(priority.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                filterPriority === priority.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {priority.icon && <priority.icon className="w-4 h-4" />}
              {priority.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Incident</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Reported</th>
                {(user?.role === 'admin' || user?.role === 'guard') && (
                  <th className="p-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading incidents...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No incidents reported.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className={`hover:bg-slate-800/30 transition-colors ${incident.priority === 'critical' ? 'bg-red-500/5' : ''}`}>
                    <td className="p-6">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {incident.priority === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
                        {incident.title}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{incident.description}</div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(incident.priority || 'medium')}`}>
                        {(incident.priority || 'medium').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        {incident.location || "N/A"}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6 text-slate-400 text-sm mono">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(incident.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    {(user?.role === 'admin' || user?.role === 'guard') && (
                      <td className="p-6">
                        <select
                          value={incident.status}
                          onChange={(e) => handleStatusUpdate(incident.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Incident Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-2">Report Incident</h2>
            <p className="text-slate-400 mb-6">Describe the issue you've encountered.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="e.g. Broken Street Light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
                  placeholder="Provide details about the incident..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Location (Optional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="e.g. Near Main Gate"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Reporting...
                    </>
                  ) : (
                    "Report Incident"
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
