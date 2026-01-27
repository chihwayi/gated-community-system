import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Shield, Users, Loader2 } from "lucide-react";
import { userService, User as UserType } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { API_CONFIG } from "@/lib/api-config";

export default function FamilySection() {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHousehold();
  }, []);

  const loadHousehold = async () => {
    try {
      const data = await userService.getHouseholdMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load household members", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileImageUrl = (profilePath?: string) => {
    if (!profilePath) return null;
    if (profilePath.startsWith("http")) return profilePath;
    // Assuming backend returns a presigned URL in a real scenario, 
    // but if it's just a path, we might need to fetch it or use a static proxy if public.
    // However, for Minio private buckets, we need presigned URLs.
    // The current User model has profile_picture as a string (key).
    // We haven't implemented a "get user with presigned url" endpoint yet,
    // BUT the Login/Me endpoint returns the User object. 
    // Does it compute the URL?
    // Let's check User Schema in backend.
    return null; 
  };
  
  // Correction: The backend User schema does NOT currently have a computed `profile_picture_url`.
  // We added `profile_picture` column.
  // We need to update User Schema to return the URL.
  // I should do that.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Household Members</h2>
          <p className="text-slate-400">Manage family members linked to your residence</p>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
          <Users className="w-6 h-6 text-indigo-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div 
              key={member.id} 
              className={`bg-slate-800 rounded-xl p-6 border transition-all ${
                member.id === user?.id 
                  ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10" 
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border-2 border-slate-600">
                  {member.profile_picture_url ? (
                     <img 
                       src={member.profile_picture_url} 
                       alt={member.full_name} 
                       className="w-full h-full object-cover"
                     />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-100 truncate">
                      {member.full_name}
                    </h3>
                    {member.id === user?.id && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                        You
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone size={14} className="shrink-0" />
                        <span>{member.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} />
                  <span>{member.role}</span>
                </div>
                <div>
                  {member.is_active ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : (
                    <span className="text-slate-500">Inactive</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-slate-800/50 rounded-xl p-6 border border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[160px]">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
              <Users className="w-6 h-6 text-slate-500 group-hover:text-indigo-400" />
            </div>
            <h3 className="font-medium text-slate-300 group-hover:text-indigo-300">Add Family Member</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-[200px]">
              Contact administration to add new household members to this address.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
