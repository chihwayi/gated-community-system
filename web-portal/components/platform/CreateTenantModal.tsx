"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { tenantService, TenantCreate } from "@/services/tenantService";

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTenantModal({ isOpen, onClose, onSuccess }: CreateTenantModalProps) {
  const [formData, setFormData] = useState<TenantCreate>({
    name: "",
    slug: "",
    domain: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await tenantService.createTenant(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
    
    // Auto-generate slug from name if slug is empty
    if (name === 'name' && !formData.slug) {
        setFormData(prev => ({
            ...prev,
            slug: value.toLowerCase().replace(/[^a-z0-9]/g, '-')
        }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100">Create New Community</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Community Details</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Sunset Hills"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Slug (URL)</label>
                    <input
                        type="text"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                        placeholder="e.g. sunset-hills"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Custom Domain (Optional)</label>
                <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    placeholder="e.g. sunsethills.com"
                />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Admin Account</h3>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Admin Name</label>
                <input
                    type="text"
                    name="admin_name"
                    required
                    value={formData.admin_name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    placeholder="Full Name"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email</label>
                <input
                    type="email"
                    name="admin_email"
                    required
                    value={formData.admin_email}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    placeholder="admin@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                    type="password"
                    name="admin_password"
                    required
                    value={formData.admin_password}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    placeholder="••••••••"
                />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
