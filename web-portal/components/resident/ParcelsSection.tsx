import React, { useState, useEffect } from "react";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Loader2,
  MapPin,
  Truck
} from "lucide-react";
import { parcelService, Parcel, ParcelStatus } from "@/services/parcelService";

export default function ParcelsSection() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadParcels();
  }, []);

  const loadParcels = async () => {
    setIsLoading(true);
    try {
      const response = await parcelService.getMyParcels();
      setParcels(response.data);
    } catch (error) {
      console.error("Failed to load parcels", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingParcels = parcels.filter(p => p.status === ParcelStatus.AT_GATE);
  const historyParcels = parcels.filter(p => p.status !== ParcelStatus.AT_GATE);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">My Parcels</h2>
        <p className="text-slate-400">Track your deliveries and collection codes</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          {/* Pending Parcels */}
          {pendingParcels.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Waiting for Collection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingParcels.map((parcel) => (
                  <div 
                    key={parcel.id}
                    className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-slate-900/50 border border-cyan-500/30 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Package className="w-24 h-24" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                          <Package className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20">
                          READY TO PICKUP
                        </span>
                      </div>
                      
                      {parcel.display_image_url && (
                        <div className="mb-6 rounded-xl overflow-hidden h-40 relative">
                          <img 
                            src={parcel.display_image_url} 
                            alt="Parcel" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <p className="text-slate-400 text-sm mb-1">Pickup Code</p>
                        <div className="text-4xl font-mono font-bold text-white tracking-widest">
                          {parcel.pickup_code}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate-500" />
                          <span>{parcel.carrier || "Unknown Carrier"}</span>
                        </div>
                        {parcel.notes && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                            <span className="italic">{parcel.notes}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                        Arrived: {new Date(parcel.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              History
            </h3>
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
              {historyParcels.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No parcel history found.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {historyParcels.map((parcel) => (
                    <div key={parcel.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">
                            {parcel.carrier || "Package"} 
                            <span className="ml-2 text-xs text-slate-500">#{parcel.id}</span>
                          </div>
                          <div className="text-sm text-slate-500">
                            {parcel.status === ParcelStatus.COLLECTED 
                              ? `Collected on ${new Date(parcel.collected_at || "").toLocaleDateString()}` 
                              : `Returned`}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        parcel.status === ParcelStatus.COLLECTED 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {parcel.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
