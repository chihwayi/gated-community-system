"use client";

import React, { useState, useEffect } from "react";
import { Car, Search, Shield, Filter } from "lucide-react";
import { vehicleService, Vehicle } from "@/services/vehicleService";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await vehicleService.getVehicles();
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to load vehicles", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.parking_slot?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Vehicle Registry</h1>
          <p className="text-slate-400 mt-1">Monitor and manage resident vehicles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Vehicles</p>
              <p className="text-2xl font-bold text-slate-100">{vehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Assigned Slots</p>
              <p className="text-2xl font-bold text-slate-100">
                {vehicles.filter(v => v.parking_slot).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search license plate, make, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/50">
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Vehicle Info</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">License Plate</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Color</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Parking Slot</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Owner ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading registry...</td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No vehicles found matching your search.</td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{vehicle.make} {vehicle.model}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono bg-slate-950 px-2 py-1 rounded border border-white/10 text-cyan-400">
                        {vehicle.license_plate}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{vehicle.color || "-"}</td>
                    <td className="p-4">
                      {vehicle.parking_slot ? (
                        <span className="text-emerald-400 font-medium">{vehicle.parking_slot}</span>
                      ) : (
                        <span className="text-slate-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      User #{vehicle.user_id}
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
