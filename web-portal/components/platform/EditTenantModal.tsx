"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Upload } from "lucide-react";
import { tenantService, Tenant, TenantUpdate } from "@/services/tenantService";
import { fileService } from "@/services/fileService";
import { packageService, Package } from "@/services/packageService";

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: Tenant | null;
}

export default function EditTenantModal({ isOpen, onClose, onSuccess, tenant }: EditTenantModalProps) {
  const [formData, setFormData] = useState<TenantUpdate>({
    name: "",
    slug: "",
    domain: "",
    is_active: true,
    primary_color: "",
    accent_color: "",
    logo_url: "",
    max_admins: 1,
    max_guards: 2,
    max_residents: 20,
    package_id: undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  useEffect(() => {
    if (isOpen) {
        fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
        setLoadingPackages(true);
        const data = await packageService.getAllPackages();
        setPackages(data);
    } catch (err) {
        console.error("Failed to fetch packages", err);
    } finally {
        setLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain || "",
        is_active: tenant.is_active,
        primary_color: tenant.primary_color || "",
        accent_color: tenant.accent_color || "",
        logo_url: tenant.logo_url || "",
        max_admins: tenant.max_admins ?? 1,
        max_guards: tenant.max_guards ?? 2,
        max_residents: tenant.max_residents ?? 20,
        package_id: tenant.package_id
      });
    }
  }, [tenant]);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pkgId = parseInt(e.target.value);
    if (!pkgId) {
        setFormData(prev => ({ ...prev, package_id: undefined }));
        return;
    }

    const selectedPkg = packages.find(p => p.id === pkgId);
    if (selectedPkg) {
        setFormData(prev => ({
            ...prev,
            package_id: selectedPkg.id,
            max_admins: selectedPkg.max_admins,
            max_guards: selectedPkg.max_guards,
            max_residents: selectedPkg.max_residents,
            plan: selectedPkg.name.toLowerCase()
        }));
    }
  };

  if (!isOpen || !tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await tenantService.updateTenant(tenant.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        setUploadingLogo(true);
        const url = await fileService.upload(file);
        setFormData(prev => ({ ...prev, logo_url: url }));
    } catch (err: any) {
        setError("Failed to upload logo: " + err.message);
    } finally {
        setUploadingLogo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100">Edit Community</h2>
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
            
            {/* Logo Upload */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                    {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Upload className="w-6 h-6 text-slate-600" />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Community Logo</label>
                    <label className="inline-flex items-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                </div>
            </div>

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
                    placeholder="e.g. community.com"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Primary Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            name="primary_color"
                            value={formData.primary_color || "#3b82f6"}
                            onChange={handleChange}
                            className="h-10 w-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input
                            type="text"
                            name="primary_color"
                            value={formData.primary_color}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                            placeholder="#3b82f6"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Accent Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            name="accent_color"
                            value={formData.accent_color || "#06b6d4"}
                            onChange={handleChange}
                            className="h-10 w-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input
                            type="text"
                            name="accent_color"
                            value={formData.accent_color}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                            placeholder="#06b6d4"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-300">
                    Active Status
                </label>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Package & Limits</h3>
                    {loadingPackages && <Loader2 className="w-3 h-3 animate-spin text-purple-500" />}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Select Package</label>
                    <select
                        onChange={handlePackageChange}
                        value={formData.package_id || ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500 appearance-none"
                    >
                        <option value="">Custom / No Package</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>
                                {pkg.name} (${pkg.price}/mo) - {pkg.max_residents} Residents
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Max Admins</label>
                        <input
                            type="number"
                            name="max_admins"
                            min="0"
                            value={formData.max_admins}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Max Guards</label>
                        <input
                            type="number"
                            name="max_guards"
                            min="0"
                            value={formData.max_guards}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Max Residents</label>
                        <input
                            type="number"
                            name="max_residents"
                            min="0"
                            value={formData.max_residents}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
