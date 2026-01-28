"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit2, 
  Trash2,
  Dumbbell,
  Users,
  Loader2,
  X
} from "lucide-react";
import { amenityService, Amenity, AmenityCreate, AmenityStatus } from "@/services/amenityService";
import { bookingService, Booking } from "@/services/bookingService";
import { useToast } from "@/context/ToastContext";
import { useConfirmation } from "@/context/ConfirmationContext";

export default function AmenitiesPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [activeTab, setActiveTab] = useState<'amenities' | 'bookings'>('amenities');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AmenityCreate>({
    name: "",
    description: "",
    capacity: 0,
    status: "available",
    open_hours: "",
    requires_approval: false
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'amenities') {
        const data = await amenityService.getAmenities();
        setAmenities(data);
      } else {
        const data = await bookingService.getBookings();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAmenity) {
        await amenityService.updateAmenity(editingAmenity.id, formData);
      } else {
        await amenityService.createAmenity(formData);
      }
      setIsModalOpen(false);
      loadData();
      showToast(editingAmenity ? "Amenity updated successfully" : "Amenity created successfully", "success");
    } catch (error) {
      console.error("Failed to save amenity", error);
      showToast("Failed to save amenity", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({
      title: "Delete Amenity",
      message: "Are you sure you want to delete this amenity?",
      confirmLabel: "Delete",
      variant: "danger"
    }))) return;
    try {
      await amenityService.deleteAmenity(id);
      loadData();
      showToast("Amenity deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete amenity", error);
      showToast("Failed to delete amenity", "error");
    }
  };

  const openCreateModal = () => {
    setEditingAmenity(null);
    setFormData({
      name: "",
      description: "",
      capacity: 0,
      status: "available",
      open_hours: "",
      requires_approval: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name: amenity.name,
      description: amenity.description,
      capacity: amenity.capacity,
      status: amenity.status,
      open_hours: amenity.open_hours,
      requires_approval: amenity.requires_approval
    });
    setIsModalOpen(true);
  };

  const handleBookingAction = async (bookingId: number, status: 'confirmed' | 'rejected') => {
    try {
      await bookingService.updateBooking(bookingId, status);
      loadData();
      showToast("Booking updated successfully", "success");
    } catch (error) {
      console.error("Failed to update booking", error);
      showToast("Failed to update booking", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Amenity Management</h1>
          <p className="text-slate-400">Manage community facilities and bookings</p>
        </div>
        <div className="flex gap-3">
           <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('amenities')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'amenities' 
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Amenities
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'bookings' 
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bookings
            </button>
          </div>
          {activeTab === 'amenities' && (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/20 active:scale-95 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Amenity
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : activeTab === 'amenities' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Capacity</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {amenities.map((amenity) => (
                  <tr key={amenity.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{amenity.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{amenity.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        amenity.status === 'available' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        amenity.status === 'maintenance' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {amenity.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{amenity.capacity || '-'}</td>
                    <td className="p-4 text-slate-400">{amenity.open_hours || '-'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(amenity)}
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(amenity.id)}
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Booking ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amenity</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-400">#{booking.id}</td>
                    <td className="p-4 text-slate-200">User #{booking.user_id}</td>
                    <td className="p-4 text-slate-200">Amenity #{booking.amenity_id}</td>
                    <td className="p-4 text-slate-400 text-sm">
                      <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                      <div className="text-xs opacity-70">
                        {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        booking.status === 'confirmed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        booking.status === 'pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {booking.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'confirmed')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Amenity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6">
              {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g. Swimming Pool"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-24 resize-none"
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as AmenityStatus})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={formData.open_hours}
                  onChange={e => setFormData({...formData, open_hours: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g. 06:00 - 22:00"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="approval"
                  checked={formData.requires_approval}
                  onChange={e => setFormData({...formData, requires_approval: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/50"
                />
                <label htmlFor="approval" className="text-sm text-slate-300">Requires Admin Approval for Booking</label>
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Amenity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
