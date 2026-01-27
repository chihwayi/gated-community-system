import React, { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  Users,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Loader2,
  X
} from "lucide-react";
import { amenityService, Amenity, AmenityStatus } from "@/services/amenityService";
import { bookingService, Booking, BookingStatus } from "@/services/bookingService";
import { useToast } from "@/context/ToastContext";

export default function AmenitiesSection() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'amenities' | 'my-bookings'>('amenities');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTimeStart, setBookingTimeStart] = useState("");
  const [bookingTimeEnd, setBookingTimeEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleBookClick = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setIsBookingModalOpen(true);
    // Reset form
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingTimeStart("10:00");
    setBookingTimeEnd("11:00");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity) return;

    setIsSubmitting(true);
    try {
      const startDateTime = `${bookingDate}T${bookingTimeStart}:00`;
      const endDateTime = `${bookingDate}T${bookingTimeEnd}:00`;

      await bookingService.createBooking({
        amenity_id: selectedAmenity.id,
        start_time: startDateTime,
        end_time: endDateTime
      });

      setIsBookingModalOpen(false);
      setActiveTab('my-bookings');
      showToast("Booking request submitted successfully!", "success");
    } catch (error) {
      console.error("Failed to book amenity", error);
      showToast("Failed to book amenity", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Amenities & Facilities</h2>
          <p className="text-slate-400">Book community facilities for your use</p>
        </div>
        <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('amenities')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'amenities' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Available Amenities
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'my-bookings' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Bookings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : activeTab === 'amenities' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity) => (
              <div 
                key={amenity.id}
                className="group p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-slate-800/50 relative overflow-hidden"
              >
                {amenity.display_image_url ? (
                  <div className="h-32 -mx-5 -mt-5 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                    <img 
                      src={amenity.display_image_url} 
                      alt={amenity.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-5 z-20">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${
                        amenity.status === AmenityStatus.AVAILABLE ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        amenity.status === AmenityStatus.MAINTENANCE ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {amenity.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    amenity.status === AmenityStatus.AVAILABLE ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                    amenity.status === AmenityStatus.MAINTENANCE ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                    'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {amenity.status.toUpperCase()}
                  </span>
                </div>
                )}
                
                <h3 className="text-lg font-bold text-slate-100 mb-1">{amenity.name}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{amenity.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{amenity.open_hours || '24/7 Access'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>Capacity: {amenity.capacity || 'Unlimited'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleBookClick(amenity)}
                  disabled={amenity.status !== AmenityStatus.AVAILABLE}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </button>
              </div>
            ))}
            {amenities.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                No amenities found.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-800/50 transition-colors"
              >
                <div className="p-3 rounded-xl bg-slate-800 text-cyan-400 h-fit">
                  <Calendar className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-slate-200">Booking #{booking.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      booking.status === BookingStatus.CONFIRMED ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      booking.status === BookingStatus.PENDING ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mb-1">
                    Amenity ID: {booking.amenity_id}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(booking.start_time).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                      {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>

                {booking.status === BookingStatus.PENDING && (
                  <button 
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium transition-all"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            ))}
             {bookings.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                You haven't made any bookings yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsBookingModalOpen(false)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-1">Book {selectedAmenity.name}</h2>
            <p className="text-sm text-slate-400 mb-6">Select your preferred date and time</p>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookingTimeStart}
                    onChange={e => setBookingTimeStart(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={bookingTimeEnd}
                    onChange={e => setBookingTimeEnd(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
