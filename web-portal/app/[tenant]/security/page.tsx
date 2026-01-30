"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Search, 
  User as UserIcon, 
  Car, 
  Clock, 
  CheckCircle, 
  LogOut,
  ScanLine,
  Activity,
  AlertTriangle,
  MapPin,
  Package,
  X,
  QrCode,
  Truck,
  FileText,
  ChevronRight,
  Filter
} from "lucide-react";
import { visitorService, Visitor } from "@/services/visitorService";
import { staffService, Staff } from "@/services/staffService";
import { incidentService, Incident } from "@/services/incidentService";
import { securityService } from "@/services/securityService";
import { parcelService, Parcel, ParcelStatus } from "@/services/parcelService";
import { vehicleService, Vehicle } from "@/services/vehicleService";
import { userService, User } from "@/services/userService";
import { accessLogService } from "@/services/accessLogService";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { QRScanner } from "@/components/ui/QRScanner";
import { toast } from "react-hot-toast";

type Tab = 'access' | 'parcels' | 'vehicles';

export default function SecurityGuardPage() {
  const { logout } = useAuth();
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<Tab>('access');
  
  // Access Control State
  const [accessCode, setAccessCode] = useState("");
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [scannedUserData, setScannedUserData] = useState<any>(null); // Raw QR data
  const [staffStatus, setStaffStatus] = useState<'checked_in' | 'checked_out' | 'unknown'>('unknown');
  const [showScanner, setShowScanner] = useState(false);
  
  // Parcels State
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [showReceiveParcel, setShowReceiveParcel] = useState(false);
  const [newParcelData, setNewParcelData] = useState({ recipient_id: "", carrier: "", notes: "" });
  const [residents, setResidents] = useState<User[]>([]);

  // Vehicles State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");

  // Shared State
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [itemsCarriedIn, setItemsCarriedIn] = useState("");
  const [itemsCarriedOut, setItemsCarriedOut] = useState("");

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'parcels') {
      fetchParcels();
      fetchResidents();
    } else if (activeTab === 'vehicles') {
      fetchVehicles();
    }
  }, [activeTab]);

  const fetchIncidents = async () => {
    try {
      const data = await incidentService.getIncidents();
      const activeIncidents = data.filter(inc => 
        (inc.priority === 'critical' || inc.priority === 'high') && 
        inc.status !== 'closed' && inc.status !== 'resolved'
      );
      setIncidents(activeIncidents);
    } catch (error) {
      console.error("Failed to fetch incidents", error);
    }
  };

  const fetchParcels = async () => {
    try {
      const { data } = await parcelService.getAllParcels(ParcelStatus.AT_GATE);
      setParcels(data);
    } catch (error) {
      toast.error("Failed to load parcels");
    }
  };

  const fetchResidents = async () => {
    try {
      const data = await userService.getResidents();
      setResidents(data);
    } catch (error) {
      console.error("Failed to load residents");
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data } = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      toast.error("Failed to load vehicles");
    }
  };

  // --- Access Control Handlers ---

  const handleScan = async (data: string) => {
    setShowScanner(false);
    try {
      // Try to parse as JSON (Digital ID)
      const parsed = JSON.parse(data);
      if (parsed.type === 'digital_id' && parsed.userId) {
        setIsLoading(true);
        try {
          const user = await userService.getUser(parsed.userId);
          setScannedUser(user);
          setScannedUserData(parsed);
          toast.success("Digital ID Verified");
        } catch (e) {
          toast.error("Invalid Digital ID or User not found");
        } finally {
          setIsLoading(false);
        }
        return;
      }
    } catch (e) {
      // Not JSON, treat as Access Code
      setAccessCode(data);
      handleSearch(null, data);
    }
  };

  const handleSearch = async (e: React.FormEvent | null, codeOverride?: string) => {
    if (e) e.preventDefault();
    const code = codeOverride || accessCode;
    if (!code.trim()) return;

    setIsLoading(true);
    setVisitor(null);
    setStaff(null);
    setScannedUser(null);
    setItemsCarriedIn("");
    setItemsCarriedOut("");

    try {
      try {
        const visitorData = await visitorService.getVisitorByAccessCode(code.trim());
        setVisitor(visitorData);
        return;
      } catch (err) {
        const staffData = await staffService.getStaffByAccessCode(code.trim());
        setStaff(staffData);
        // Check attendance...
        try {
           const attendance = await staffService.getAttendance(staffData.id);
           // ... logic for status
           setStaffStatus('unknown'); // Simplified for now
        } catch (e) {}
      }
    } catch (err) {
      toast.error("Invalid Access Code. Entry Not Found.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!visitor && !staff) return;
    setActionLoading(true);
    try {
      if (visitor) {
        await visitorService.checkInVisitor(visitor.id, itemsCarriedIn);
        toast.success(`Visitor ${visitor.full_name} checked in`);
        setVisitor({ ...visitor, status: 'checked_in', check_in_time: new Date().toISOString() });
      } else if (staff) {
        await staffService.checkInStaff(staff.id);
        toast.success(`Staff ${staff.full_name} checked in`);
        setStaffStatus('checked_in');
      }
    } catch (error: any) {
      toast.error(error.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!visitor && !staff) return;
    setActionLoading(true);
    try {
      if (visitor) {
        await visitorService.checkOutVisitor(visitor.id, itemsCarriedOut);
        toast.success(`Visitor ${visitor.full_name} checked out`);
        setVisitor({ ...visitor, status: 'checked_out', check_out_time: new Date().toISOString() });
      } else if (staff) {
        await staffService.checkOutStaff(staff.id);
        toast.success(`Staff ${staff.full_name} checked out`);
        setStaffStatus('checked_out');
      }
    } catch (error) {
      toast.error('Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Parcel Handlers ---

  const handleCreateParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcelData.recipient_id) return;
    
    setActionLoading(true);
    try {
      await parcelService.createParcel({
        recipient_id: parseInt(newParcelData.recipient_id),
        carrier: newParcelData.carrier,
        notes: newParcelData.notes
      });
      toast.success("Parcel received and resident notified");
      setShowReceiveParcel(false);
      setNewParcelData({ recipient_id: "", carrier: "", notes: "" });
      fetchParcels();
    } catch (error) {
      toast.error("Failed to create parcel record");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollectParcel = async (id: number) => {
    if (!confirm("Confirm resident has collected this parcel?")) return;
    try {
      await parcelService.markCollected(id);
      toast.success("Parcel marked as collected");
      fetchParcels();
    } catch (error) {
      toast.error("Failed to update parcel status");
    }
  };

  // --- Patrol Log ---

  const handleLogPatrol = async () => {
    setActionLoading(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      setActionLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await securityService.createPatrolLog(latitude, longitude, "Regular patrol check");
          toast.success("Patrol logged successfully at your location");
        } catch (error) {
          toast.error("Failed to log patrol");
        } finally {
          setActionLoading(false);
        }
      },
      (error) => {
        toast.error("Unable to retrieve location");
        setActionLoading(false);
      }
    );
  };

  const handleLogResidentAccess = async (direction: 'entry' | 'exit') => {
    if (!scannedUser) return;
    setActionLoading(true);
    try {
      await accessLogService.createAccessLog({
        user_id: scannedUser.id,
        direction,
        method: 'digital_id'
      });
      toast.success(`Resident ${direction} logged successfully`);
      // Optional: Clear scanned user after log? 
      // setScannedUser(null); 
    } catch (error) {
      console.error(error);
      toast.error(`Failed to log resident ${direction}`);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderAccessTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ScanLine className="text-blue-400" />
            Verify Access
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Or enter code manually</span>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter Access Code..."
                className="flex-1 bg-slate-800 border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg tracking-widest text-center uppercase"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 px-4 rounded-xl transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[300px] flex flex-col justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Activity className="w-8 h-8 animate-spin text-blue-500" />
              <p>Verifying...</p>
            </div>
          ) : scannedUser ? (
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                   {scannedUser.profile_picture ? (
                     <img src={scannedUser.profile_picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                   ) : (
                     <UserIcon className="w-10 h-10 text-blue-400" />
                   )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{scannedUser.full_name}</h3>
                  <p className="text-blue-400 font-medium uppercase tracking-wide">{scannedUser.role.replace('_', ' ')}</p>
                  <p className="text-slate-400 text-sm mt-1">{scannedUser.house_address || 'No Address'}</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-lg">
                    <CheckCircle className="w-6 h-6" />
                    <span>IDENTITY VERIFIED</span>
                  </div>
                  <p className="text-xs text-green-500/60 mt-1">Valid Digital ID</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => handleLogResidentAccess('entry')}
                    disabled={actionLoading}
                    className="py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    Log Entry
                  </button>
                  <button
                    onClick={() => handleLogResidentAccess('exit')}
                    disabled={actionLoading}
                    className="py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    Log Exit
                  </button>
                </div>
             </div>
          ) : visitor ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{visitor.full_name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2 ${
                  visitor.status === 'checked_in' ? 'bg-green-500/20 text-green-400' : 
                  visitor.status === 'checked_out' ? 'bg-slate-700 text-slate-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {visitor.status.replace('_', ' ')}
                </span>
                <p className="text-slate-400 mt-2 text-sm">Visiting: {visitor.host?.house_address || 'Unknown Unit'}</p>
                <p className="text-slate-500 text-xs">Type: {visitor.visitor_type}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Check-In Section */}
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <div className="relative">
                    <label className="text-xs text-slate-400 mb-1 block">Items Carried In</label>
                    <input 
                      type="text" 
                      placeholder="Laptop, tools, etc."
                      value={itemsCarriedIn}
                      onChange={(e) => setItemsCarriedIn(e.target.value)}
                      disabled={visitor.status !== 'expected' && visitor.status !== 'pending'}
                      className="w-full bg-slate-800 border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading || visitor.status === 'checked_in' || visitor.status === 'checked_out' || visitor.status === 'expired'}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                  >
                    Check In
                  </button>
                </div>

                {/* Check-Out Section */}
                <div className="col-span-2 md:col-span-1 space-y-2">
                   <div className="relative">
                    <label className="text-xs text-slate-400 mb-1 block">Items Carried Out</label>
                    <input 
                      type="text" 
                      placeholder="Verify items..."
                      value={itemsCarriedOut}
                      onChange={(e) => setItemsCarriedOut(e.target.value)}
                      disabled={visitor.status !== 'checked_in'}
                      className="w-full bg-slate-800 border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  {visitor.allowed_items_out && (
                     <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded-lg">
                       <p className="text-xs text-blue-300 font-semibold mb-1">Allowed to take out:</p>
                       <p className="text-sm text-white">{visitor.allowed_items_out}</p>
                     </div>
                  )}

                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading || visitor.status !== 'checked_in'}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                  >
                    Check Out
                  </button>
                </div>
              </div>
            </div>
          ) : staff ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{staff.full_name}</h3>
                <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider mt-2">
                  {staff.staff_type}
                </span>
                <p className="text-slate-400 mt-2 text-sm">Status: {staffStatus.replace('_', ' ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading || staffStatus === 'checked_in'}
                  className="py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-medium"
                >
                  Clock In
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading || staffStatus === 'checked_out'}
                  className="py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl font-medium"
                >
                  Clock Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Shield className="w-12 h-12 opacity-20" />
              <p>Ready to verify access</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderParcelsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Parcels at Gate</h2>
        <button 
          onClick={() => setShowReceiveParcel(true)}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
        >
          <Package className="w-4 h-4" />
          Receive Parcel
        </button>
      </div>

      <div className="grid gap-4">
        {parcels.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No parcels currently at the gate.</p>
          </div>
        ) : (
          parcels.map(parcel => (
            <div key={parcel.id} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Unit {parcel.recipient_id} (Resident)</p>
                  <p className="text-sm text-slate-400">{parcel.carrier || 'Unknown Carrier'} • {parcel.notes || 'No notes'}</p>
                </div>
              </div>
              <button 
                onClick={() => handleCollectParcel(parcel.id)}
                className="px-4 py-2 bg-slate-800 hover:bg-green-600 hover:text-white text-slate-300 rounded-lg text-sm transition-colors"
              >
                Mark Collected
              </button>
            </div>
          ))
        )}
      </div>

      {showReceiveParcel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4">Receive New Parcel</h3>
            <form onSubmit={handleCreateParcel} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Resident / Unit</label>
                <select 
                  className="w-full bg-slate-800 border-white/10 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  value={newParcelData.recipient_id}
                  onChange={e => setNewParcelData({...newParcelData, recipient_id: e.target.value})}
                  required
                >
                  <option value="">Select Resident...</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.full_name} ({r.house_address})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Carrier (Optional)</label>
                <input 
                  type="text"
                  className="w-full bg-slate-800 border-white/10 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DHL, FedEx, Amazon..."
                  value={newParcelData.carrier}
                  onChange={e => setNewParcelData({...newParcelData, carrier: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes</label>
                <textarea 
                  className="w-full bg-slate-800 border-white/10 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Package description..."
                  value={newParcelData.notes}
                  onChange={e => setNewParcelData({...newParcelData, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowReceiveParcel(false)}
                  className="flex-1 py-3 bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 rounded-xl font-medium"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderVehiclesTab = () => (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search License Plate..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={vehicleSearch}
            onChange={e => setVehicleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {vehicles
          .filter(v => v.license_plate.toLowerCase().includes(vehicleSearch.toLowerCase()))
          .map(vehicle => (
          <div key={vehicle.id} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-wider font-mono">{vehicle.license_plate}</h3>
                <p className="text-sm text-slate-400">{vehicle.make} {vehicle.model} • {vehicle.color}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">Registered</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-4 sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between max-w-4xl">
          {tenant?.logo_url ? (
            <div className="flex items-center gap-4">
                 <img src={tenant.logo_url} alt={tenant.name} className="h-10 object-contain" />
                 <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">{tenant.name}</h1>
                    <p className="text-xs text-slate-400 font-medium">Gate Security</p>
                 </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">Gate Security</h1>
                  <p className="text-xs text-slate-400 font-medium">Entry Control System</p>
                </div>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <button
                onClick={handleLogPatrol}
                disabled={actionLoading}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium transition-all border border-blue-500/20"
                title="Log your current location for security patrol records"
            >
                <MapPin className="w-4 h-4" />
                {actionLoading ? "Logging..." : "Log Patrol"}
            </button>

            <button 
                onClick={logout}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 transition-colors"
            >
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-3xl relative z-10">
        
        {/* Incidents Alert */}
        {incidents.length > 0 && (
          <div className="mb-6 space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-red-600/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                    <h3 className="font-bold text-red-400">Emergency Alert</h3>
                    <p className="text-sm text-red-200">{incident.title} - {incident.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Tab Navigation */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 border border-white/5 sticky top-24 z-10 backdrop-blur-md">
            <button 
                onClick={() => setActiveTab('access')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'access' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
            >
                <Shield className="w-4 h-4" />
                Access
            </button>
            <button 
                onClick={() => setActiveTab('parcels')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'parcels' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
            >
                <Package className="w-4 h-4" />
                Parcels
            </button>
            <button 
                onClick={() => setActiveTab('vehicles')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'vehicles' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
            >
                <Car className="w-4 h-4" />
                Vehicles
            </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
            {activeTab === 'access' && renderAccessTab()}
            {activeTab === 'parcels' && renderParcelsTab()}
            {activeTab === 'vehicles' && renderVehiclesTab()}
        </div>

      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 rounded-2xl overflow-hidden border border-white/10">
                <div className="p-4 flex justify-between items-center border-b border-white/5">
                    <h3 className="font-bold text-white">Scan QR Code</h3>
                    <button onClick={() => setShowScanner(false)} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 bg-black">
                    <QRScanner 
                        onScan={handleScan}
                        onError={(err) => console.log(err)}
                    />
                </div>
                <div className="p-4 text-center text-sm text-slate-500">
                    Align code within frame
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
