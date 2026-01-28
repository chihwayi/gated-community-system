"use client";

import React, { useState, useEffect } from "react";
import { Shield, MapPin, UserX, Plus, Trash2, Search, Loader2 } from "lucide-react";
import { securityService, BlacklistEntry, PatrolLog } from "@/services/securityService";
import { useToast } from "@/context/ToastContext";
import { useConfirmation } from "@/context/ConfirmationContext";

export default function SecurityPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [activeTab, setActiveTab] = useState<'blacklist' | 'patrols'>('blacklist');
  const [isLoading, setIsLoading] = useState(false);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
  
  // Add Blacklist State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", phone_number: "", id_number: "", reason: "" });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'blacklist') {
        const data = await securityService.getBlacklist();
        setBlacklist(data);
      } else {
        const data = await securityService.getPatrolLogs();
        setPatrolLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await securityService.addToBlacklist(newItem);
      setIsAddModalOpen(false);
      setNewItem({ name: "", phone_number: "", id_number: "", reason: "" });
      fetchData();
      showToast("Added to blacklist successfully", "success");
    } catch (error) {
      showToast("Failed to add to blacklist", "error");
    }
  };

  const handleRemoveFromBlacklist = async (id: number) => {
    if (!(await confirm({
      title: "Remove from Blacklist",
      message: "Are you sure you want to remove this person from the blacklist?",
      confirmLabel: "Remove",
      variant: "warning"
    }))) return;
    try {
      await securityService.removeFromBlacklist(id);
      fetchData();
      showToast("Removed from blacklist successfully", "success");
    } catch (error) {
      showToast("Failed to remove from blacklist", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-100 font-sora">Security Operations</h1>
            <p className="text-slate-400">Manage security threats and monitor patrols</p>
        </div>
        {activeTab === 'blacklist' && (
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" /> Add to Blacklist
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('blacklist')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'blacklist'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4" />
            Visitor Blacklist
          </div>
        </button>
        <button
          onClick={() => setActiveTab('patrols')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'patrols'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Patrol Logs
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
        {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
            </div>
        ) : activeTab === 'blacklist' ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Phone / ID</th>
                            <th className="px-6 py-4 font-medium">Reason</th>
                            <th className="px-6 py-4 font-medium">Date Added</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {blacklist.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No blacklist entries found.
                                </td>
                            </tr>
                        ) : (
                            blacklist.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-200 font-medium">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-400">
                                        <div className="flex flex-col">
                                            <span>{item.phone_number || '-'}</span>
                                            <span className="text-xs opacity-70">{item.id_number}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-red-400">{item.reason || 'No reason provided'}</td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemoveFromBlacklist(item.id)}
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Timestamp</th>
                            <th className="px-6 py-4 font-medium">Guard ID</th>
                            <th className="px-6 py-4 font-medium">Location</th>
                            <th className="px-6 py-4 font-medium">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {patrolLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No patrol logs found.
                                </td>
                            </tr>
                        ) : (
                            patrolLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-200">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">#{log.guard_id}</td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                        {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{log.notes || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-100 mb-4">Add to Blacklist</h2>
                <form onSubmit={handleAddToBlacklist} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400">Name</label>
                        <input
                            type="text"
                            required
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">Phone Number</label>
                        <input
                            type="text"
                            value={newItem.phone_number}
                            onChange={(e) => setNewItem({...newItem, phone_number: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">ID Number</label>
                        <input
                            type="text"
                            value={newItem.id_number}
                            onChange={(e) => setNewItem({...newItem, id_number: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">Reason</label>
                        <textarea
                            required
                            value={newItem.reason}
                            onChange={(e) => setNewItem({...newItem, reason: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 mt-1"
                        />
                    </div>
                    <div className="flex gap-2 justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-slate-400 hover:text-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                        >
                            Add Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
