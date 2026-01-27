"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { packageService, PackageCreate } from "@/services/packageService";

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePackageModal({ isOpen, onClose, onSuccess }: CreatePackageModalProps) {
  const [formData, setFormData] = useState<PackageCreate>({
    name: "",
    description: "",
    price: 0,
    max_admins: 1,
    max_guards: 2,
    max_residents: 20,
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
      await packageService.createPackage(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100">Create New Package</h2>
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
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Package Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Basic Plan"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    placeholder="Description of the package..."
                    rows={3}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
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
              Create Package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
