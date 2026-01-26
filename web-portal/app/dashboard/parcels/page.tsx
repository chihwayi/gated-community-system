"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Plus, Check, X, Clock, User as UserIcon } from "lucide-react";
import { parcelService, Parcel, ParcelStatus } from "@/services/parcelService";
import { userService, User } from "@/services/userService";

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [residents, setResidents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [newParcel, setNewParcel] = useState({
    recipient_id: "",
    carrier: "",
    notes: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadParcels();
    loadResidents();
  }, []);

  const loadParcels = async () => {
    setIsLoading(true);
    try {
      const response = await parcelService.getAllParcels();
      setParcels(response.data);
    } catch (error) {
      console.error("Failed to load parcels", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResidents = async () => {
    try {
      const data = await userService.getResidents();
      setResidents(data);
    } catch (error) {
      console.error("Failed to load residents", error);
    }
  };

  const handleReceiveParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcel.recipient_id) return;

    try {
      await parcelService.createParcel({
        recipient_id: parseInt(newParcel.recipient_id),
        carrier: newParcel.carrier,
        notes: newParcel.notes
      });
      setShowReceiveModal(false);
      setNewParcel({ recipient_id: "", carrier: "", notes: "" });
      loadParcels();
    } catch (error) {
      console.error("Failed to receive parcel", error);
      alert("Failed to receive parcel");
    }
  };

  const handleCollect = async (id: number) => {
    if (!confirm("Confirm parcel collection?")) return;
    try {
      await parcelService.markCollected(id);
      loadParcels();
    } catch (error) {
      console.error("Failed to mark collected", error);
      alert("Failed to mark collected");
    }
  };

  const filteredParcels = parcels.filter(p => {
    const isStatusMatch = activeTab === 'pending' 
      ? p.status === ParcelStatus.AT_GATE 
      : p.status !== ParcelStatus.AT_GATE;
    
    if (!isStatusMatch) return false;

    const recipient = residents.find(r => r.id === p.recipient_id);
    const searchString = `${p.pickup_code} ${p.carrier} ${recipient?.full_name} ${recipient?.house_address}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Parcel Management</h1>
          <p className="text-slate-400 mt-1">Log incoming packages and manage collections</p>
        </div>
        <button 
          onClick={() => setShowReceiveModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Receive Parcel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'pending' ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Collection
            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-xs">
              {parcels.filter(p => p.status === ParcelStatus.AT_GATE).length}
            </span>
          </div>
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'history' ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            History
          </div>
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          type="text"
          placeholder="Search pickup code, recipient, or carrier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredParcels.map((parcel) => {
          const recipient = residents.find(r => r.id === parcel.recipient_id);
          return (
            <div key={parcel.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative group hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-800 rounded-xl text-slate-300">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-mono font-bold text-white tracking-wider">
                      {parcel.pickup_code}
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-semibold">Pickup Code</div>
                  </div>
                </div>
                {parcel.status === ParcelStatus.AT_GATE && (
                  <button 
                    onClick={() => handleCollect(parcel.id)}
                    className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                    title="Mark Collected"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-medium">{recipient?.full_name || `User #${parcel.recipient_id}`}</div>
                    <div className="text-xs text-slate-500">{recipient?.house_address || "Unknown Address"}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-slate-500">C</span>
                  <span>{parcel.carrier || "Unknown Carrier"}</span>
                </div>

                {parcel.notes && (
                  <div className="p-3 bg-slate-950/50 rounded-lg text-sm text-slate-400 italic">
                    "{parcel.notes}"
                  </div>
                )}

                <div className="pt-3 border-t border-white/5 text-xs text-slate-500 flex justify-between">
                  <span>Arrived: {new Date(parcel.created_at).toLocaleDateString()}</span>
                  {parcel.collected_at && (
                    <span>Collected: {new Date(parcel.collected_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredParcels.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No parcels found in this view.
          </div>
        )}
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">Receive Parcel</h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleReceiveParcel} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Recipient</label>
                <select 
                  required
                  value={newParcel.recipient_id}
                  onChange={(e) => setNewParcel({...newParcel, recipient_id: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Select Resident...</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} ({r.house_address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Carrier</label>
                <input 
                  type="text"
                  placeholder="e.g. FedEx, DHL, Amazon"
                  value={newParcel.carrier}
                  onChange={(e) => setNewParcel({...newParcel, carrier: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Notes (Optional)</label>
                <textarea 
                  placeholder="e.g. Left at reception"
                  value={newParcel.notes}
                  onChange={(e) => setNewParcel({...newParcel, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 min-h-[80px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Receive Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
