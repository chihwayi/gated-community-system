import React, { useState, useEffect } from "react";
import { 
  Car, 
  Plus, 
  Trash2, 
  Loader2, 
  X,
  AlertCircle,
  Camera
} from "lucide-react";
import { vehicleService, Vehicle, VehicleCreate } from "@/services/vehicleService";
import { uploadService } from "@/services/uploadService";
import { useToast } from "@/context/ToastContext";
import { useConfirmation } from "@/context/ConfirmationContext";

export default function VehiclesSection() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<VehicleCreate>({
    license_plate: "",
    make: "",
    model: "",
    color: "",
    parking_slot: "",
    image_url: ""
  });

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size should be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      setFormData({ ...formData, image_url: res.object_key });
      setPreviewUrl(res.url);
    } catch (error) {
      console.error("Failed to upload vehicle image", error);
      showToast("Failed to upload image", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await vehicleService.createVehicle(formData);
      setIsModalOpen(false);
      setFormData({
        license_plate: "",
        make: "",
        model: "",
        color: "",
        parking_slot: "",
        image_url: ""
      });
      setPreviewUrl(null);
      loadVehicles();
      showToast('Vehicle added successfully!', 'success');
    } catch (error) {
      console.error("Failed to add vehicle", error);
      showToast("Failed to add vehicle", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({
      title: "Remove Vehicle",
      message: "Are you sure you want to remove this vehicle?",
      confirmLabel: "Remove",
      variant: "danger"
    }))) return;
    try {
      await vehicleService.deleteVehicle(id);
      loadVehicles();
      showToast('Vehicle removed successfully', 'success');
    } catch (error) {
      console.error("Failed to delete vehicle", error);
      showToast("Failed to delete vehicle", 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">My Vehicles</h2>
          <p className="text-slate-400">Manage your registered vehicles and parking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
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
            {vehicles.map((vehicle) => (
              <div 
                key={vehicle.id}
                className="group p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-slate-800/50 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 overflow-hidden shrink-0">
                      {vehicle.display_image_url ? (
                        <img 
                          src={vehicle.display_image_url} 
                          alt={vehicle.license_plate} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-lg tracking-wider font-mono">{vehicle.license_plate}</h3>
                      <p className="text-sm text-slate-400">
                        {vehicle.color} {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                </div>
                
                {vehicle.parking_slot && (
                  <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    Parking Slot: <span className="font-mono font-bold">{vehicle.parking_slot}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5">
                  <button 
                    className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all border border-red-500/20 flex items-center justify-center gap-2"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Vehicle
                  </button>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-slate-600" />
                </div>
                <p>No vehicles registered yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">Register Vehicle</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">License Plate</label>
                <input
                  type="text"
                  required
                  value={formData.license_plate}
                  onChange={(e) => setFormData({...formData, license_plate: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600 font-mono"
                  placeholder="ABC-1234"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600"
                    placeholder="Corolla"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600"
                  placeholder="Silver"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Parking Slot (Optional)</label>
                <input
                  type="text"
                  value={formData.parking_slot}
                  onChange={(e) => setFormData({...formData, parking_slot: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600"
                  placeholder="A-101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Vehicle Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-8 h-8 text-slate-600" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="vehicle-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="vehicle-image"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors border border-white/10 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Camera className="w-4 h-4 text-cyan-400" />
                      {previewUrl ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Max 5MB. JPG, PNG supported.</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Vehicle"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
