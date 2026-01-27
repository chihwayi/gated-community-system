import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Phone, MapPin, Shield, Mail, Camera, Loader2 } from "lucide-react";
import { uploadService } from "@/services/uploadService";
import { userService } from "@/services/userService";
import { useToast } from "@/context/ToastContext";

export default function SettingsSection() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size should be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to Minio
      const uploadResult = await uploadService.uploadFile(file);
      
      // 2. Update User Profile in Backend
      if (user) {
        await userService.updateUser(user.id, {
          profile_picture: uploadResult.object_key 
        });
        
        // 3. Update Local Context (we use the URL for immediate display)
        updateUser({ 
          profile_picture: uploadResult.object_key,
          profile_picture_url: uploadResult.url 
        });
        
        showToast('Profile picture updated successfully', 'success');
      }
    } catch (error) {
      console.error("Failed to upload profile picture", error);
      showToast("Failed to upload profile picture", 'error');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          My Profile
        </h3>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl ring-4 ring-slate-800 overflow-hidden ${
            user?.profile_picture || user?.profile_picture_url ? 'bg-slate-800' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
          }`}>
            {user?.profile_picture || user?.profile_picture_url ? (
              <img 
                src={user.profile_picture_url || user.profile_picture} 
                alt={user.full_name} 
                className="w-full h-full object-cover"
              />
            ) : (
                user?.full_name ? user.full_name.charAt(0) : 'R'
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-slate-200">
                  <User className="w-4 h-4 text-slate-500" />
                  {user?.full_name || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-slate-200">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user?.email || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Phone Number</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-slate-200">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {user?.phone_number || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Address</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-slate-200">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {user?.house_address || `House #${user?.id || '?'}`}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Role</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-slate-200 capitalize">
                  <Shield className="w-4 h-4 text-slate-500" />
                  {user?.role || "Resident"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Account Settings</h3>
        <p className="text-slate-400 text-sm">
          To update your personal information or change your password, please contact the administration office.
        </p>
      </div>
    </div>
  );
}
