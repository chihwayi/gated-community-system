import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Phone, 
  Clock, 
  MoreVertical,
  Pencil,
  Trash2,
  Edit2,
  Loader2,
  X,
  User
} from "lucide-react";
import { staffService, Staff, StaffCreate, StaffType, StaffStatus } from "@/services/staffService";

export default function StaffSection() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [staffType, setStaffType] = useState<StaffType>(StaffType.MAID);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const data = await staffService.getMyStaff();
      setStaffList(data);
    } catch (error) {
      console.error("Failed to load staff", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await staffService.updateStaff(editingId, {
          full_name: fullName,
          phone_number: phoneNumber,
          staff_type: staffType,
        });
        alert("Staff updated successfully!");
      } else {
        await staffService.createStaff({
          full_name: fullName,
          phone_number: phoneNumber,
          staff_type: staffType,
        });
        alert("Staff added successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      loadStaff();
    } catch (error: any) {
      console.error("Failed to save staff", error);
      alert(error.message || "Failed to save staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm("Are you sure you want to remove this staff member? This cannot be undone.")) return;
    try {
      await staffService.deleteStaff(id);
      loadStaff();
    } catch (error) {
      console.error("Failed to delete staff", error);
      alert("Failed to delete staff");
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingId(staff.id);
    setFullName(staff.full_name);
    setPhoneNumber(staff.phone_number);
    setStaffType(staff.staff_type);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setPhoneNumber("");
    setStaffType(StaffType.MAID);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Daily Help & Staff</h2>
          <p className="text-slate-400">Manage your household staff and their access</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2 w-fit"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((staff) => (
              <div 
                key={staff.id}
                className="group p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-slate-800/50 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 text-xl font-bold">
                      {staff.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{staff.full_name}</h3>
                      <p className="text-sm text-cyan-400 capitalize">{staff.staff_type}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    staff.status === StaffStatus.ACTIVE ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                    'text-slate-400 bg-slate-500/10 border-slate-500/20'
                  }`}>
                    {staff.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{staff.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-4 h-4 flex items-center justify-center font-mono text-xs text-slate-500 border border-slate-700 rounded">
                      ID
                    </div>
                    <span>Code: <span className="text-white font-mono tracking-wider">{staff.access_code}</span></span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-2">
                   <button 
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
                    onClick={() => handleEditStaff(staff)}
                  >
                    <Edit2 className="w-4 h-4 inline mr-2" />
                    Edit
                  </button>
                  <button 
                    className="flex-1 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all border border-red-500/20"
                    onClick={() => handleDeleteStaff(staff.id)}
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {staffList.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                You haven't added any staff yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-1">Add Daily Help</h2>
            <p className="text-sm text-slate-400 mb-6">Register a new staff member</p>
            
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g. +1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                <select
                  value={staffType}
                  onChange={e => setStaffType(e.target.value as StaffType)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {Object.values(StaffType).map((type) => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
